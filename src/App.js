import React, { useState,useEffect } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  CurrentRefinements,
  ClearRefinements,
  Pagination,
  useStats
} from 'react-instantsearch';
import CustomRangeInput from './components/CustomRangeInput'
import CandidateCard from './components/CandidateCard';
import { FaBriefcase, FaBuilding, FaUserTie,FaTag, FaMapMarkerAlt, FaTimes, FaSearch, FaFileAlt, FaUserPlus , FaChartBar} from 'react-icons/fa';
import './App.css';
import Logo from './img/download.jpeg'
import axios from 'axios';
// Import S3Client and ListObjectsV2Command from the AWS SDK for S3
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";// Import the getSignedUrl function from the s3-request-presigner
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { embedDashboard } from "@superset-ui/embedded-sdk";
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  }
});

// Remove hardcoded Superset configuration
const supersetUrl = process.env.REACT_APP_SUPERSET_URL;
const username = process.env.REACT_APP_SUPERSET_USERNAME;
const password = process.env.REACT_APP_SUPERSET_PASSWORD;
const guestUsername = process.env.REACT_APP_SUPERSET_GUEST_USERNAME;
const guestFirstName = process.env.REACT_APP_SUPERSET_GUEST_FIRST_NAME;
const guestLastName = process.env.REACT_APP_SUPERSET_GUEST_LAST_NAME;

// Remove hardcoded Algolia client initialization
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);
function SupersetDashboard({ onClose }) {
  const supersetApiUrl = supersetUrl + '/api/v1/security';
  const fetchAccessToken = async () => {
    const body = {
      username:username,
      password:password,
      provider: "db",
      refresh: true,
    };

    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };

    const { data } = await axios.post(supersetApiUrl + '/login', body, config);
    return data.access_token;
  };

  const fetchGuestToken = async (accessToken) => {
    const guestTokenBody = {
      resources: [
        {
          type: "dashboard",
          id: "25a757ae-cdb6-4b05-ad53-94f8b013225c",
        }
      ],
      rls: [], // Add your RLS filters here if needed
      user: {
        username: guestUsername,
        first_name: guestFirstName,
        last_name: guestLastName,
      }
    };

    let guestTokenHeaders = {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken":"IjlkYjc0NTE1YzhmY2I0Mzg3ZjM2MDg4ZmI5NWQ5N2MxOTY0NmNmOWUi.ZwPFUA.YoxQ47DKaxAKyRzK-LlZcdVL5KU",
        "Authorization": 'Bearer ' + accessToken,
      }
    };

    const response = await axios.post(supersetApiUrl + '/guest_token/', guestTokenBody, guestTokenHeaders);
    return response.data.token;
  };

   
    
  

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const guestToken = await fetchGuestToken(accessToken);
        const embedDashboardConfig = {
          id: "25a757ae-cdb6-4b05-ad53-94f8b013225c",
          supersetDomain: supersetUrl,
          mountPoint: document.getElementById("superset-container"),
          fetchGuestToken: () =>  guestToken,
          dashboardUiConfig: {
            hideTitle: false,
            filters: {
              expanded: true,
              
            },
          }
    
        };
        embedDashboard(embedDashboardConfig);
        document.getElementById("superset-container").children[0].width="100%";
        document.getElementById("superset-container").children[0].height="100%";

  }
    catch (error) {
        console.error("Error initializing the dashboard:", error);
      }
    }
  initializeDashboard();
  }  
, []);

  return ( 
    <div id="superset-container"></div>

  )
}


function SearchTab({ filtersOpen, setFiltersOpen }) {
  return (
    <InstantSearch searchClient={searchClient} indexName="enriched_candidates">
      <div className='search-container'>
        <SearchBox component={CustomSearchBox} placeholder="Search some Talent.."/>
        

      </div>
      <div className="search-panel">
        <button className="filters-button" onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        <div className={`search-panel__filters ${filtersOpen ? 'open' : ''}`}>
          <h2>Refine Your Search</h2>
          <ClearRefinements />
          <div className="filter-section">
              <h3><FaBriefcase /> Job Title</h3>
              <RefinementList attribute="job_title" limit={5} showMore={true}
              searchable={true}
              searchablePlaceholder="Search job titles..."
               />
            </div>
            <div className="filter-section">
              <h3><FaBuilding />Company & Modes</h3>
              <RefinementList attribute="experience.company" 
              searchable={true}
              searchablePlaceholder="Search Company & Modes..."
              limit={5} showMore={true} />
            </div>
            <div className="filter-section">
              <h3><FaBuilding />Schools</h3>
              <RefinementList attribute="education_entries.school" 
              searchable={true}
              searchablePlaceholder="Search Schools/Colleges"
              limit={5} showMore={true} />
            </div>
            <div className="filter-section">
              <h3><FaMapMarkerAlt /> Location</h3>
              <RefinementList attribute="location.city" 
              searchable={true}
              searchablePlaceholder="Search Cities/Locations..."
              limit={5} showMore={true} />
            </div>
            <div className="filter-section">
              <h3><FaTag /> Tags</h3>
              <RefinementList attribute="enriched_tags" 
              searchable={true}
              searchablePlaceholder="Search Tags"
              limit={5} showMore={true} />
            </div>
            <div className="filter-section">
              <h3><FaUserTie /> Stage</h3>
              <RefinementList attribute="stage" 
              searchable={true}
              searchablePlaceholder="Search Status"
              limit={5} showMore={true} />
            </div>
            
            <div className="filter-section">
          <h3><FaBriefcase /> Experience Range</h3>
          <CustomRangeInput attribute="total_experience" min={0} max={40} />
        </div>
        </div>
        <div className="search-panel__results">
          <div className="search-panel__results-header">
            <CurrentRefinements />
            <CustomStats />
          </div>
          <Hits hitComponent={Hit} />
          <div className="pagination-container">
            <Pagination />
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}


function Hit({ hit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);


async function getPresignedUrl(bucketName, folderName, fileNameStart, expiryTime = 3600) {
  try {
    // List objects in the bucket/folder
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderName + '/'
    });

    const listResponse = await s3Client.send(listCommand);
    console.log("-----------",listResponse)

    // Find the file that starts with the given fileNameStart
    const matchingFile = listResponse.Contents.find(file => 
      file.Key.split('/').pop().startsWith(fileNameStart)
    );

    if (!matchingFile) {
      throw new Error('No matching file found');
    }

    // Generate presigned URL for the matching file
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: matchingFile.Key
    });
    
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: expiryTime });
    return url;
  } catch (err) {
    alert('Resume Not Found !!')
    console.error("Error generating presigned URL:", err);
    throw err;
  }
}



  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };


  const viewCV = async (e,hit) => {
    e.stopPropagation();
    console.log(hit)
    // Implement CV viewing logic here
    try {
      const bucketName = "prod-n8n-pdf-store";
      const folderName = hit.job_title; // Assuming the job title is the folder name
      const fileNameStart = hit.id.substring(0, 7); // Assuming the first 7 characters of the hit id is the filename start

      const presignedUrl = await getPresignedUrl(bucketName, folderName, fileNameStart);
            // Open the presigned URL in a new tab
      window.open(presignedUrl, '_blank');
    } catch (error) {
      console.error("Error viewing CV:", error);
      // Handle the error (e.g., show an error message to the user)
    }
    // You might want to open a new tab with the CV or show it in a modal
  };

  function showConfirmDialog(hit) {
    // Create a Promise that resolves with true (OK) or false (Cancel)
    const confirmPromise = new Promise((resolve, reject) => {
      const userConfirmed = window.confirm("Do you want this candidate to be tracked for Potential Signals?");
      if (userConfirmed) {
        resolve("OK");
      } else {
        resolve("Cancel");
      }
    });
  
    // Handle the result of the confirmation
    confirmPromise.then((result) => {
      if (result === "OK") {
        alert("Added the Candidate LinkedIn URL in PhantomBuster Pipeline");
      } else {
        window.open(hit.url, '_blank');
      }
    });
  }

  const trackCandidate = (e,hit) => {
    e.stopPropagation();
    // Implement candidate tracking logic here
    showConfirmDialog(hit)
    // You might want to add the candidate to a tracking list or update their status
  };


  return (
    <>
      <div className="hit-card" onClick={openModal}>
      <div className="hit-image-container">
          {hit.image_url ? (
            <img src={hit.image_url} alt={hit.name} className="hit-image" />
          ) : (
            <div className="hit-initials">
              {getInitials(hit.name)}
            </div>
          )}
        </div>
        <div className="hit-content">
          <h3>{hit.name}</h3>
          <p className="hit-job"><FaBriefcase /> {hit.job_title}  { hit.experience.find(item => item.current === true && item.company)?.company ? 'at ' +hit.experience.find(item => item.current === true && item.company)?.company :'' }</p>
          <p className="hit-location"><FaMapMarkerAlt /> {hit.location.city}, {hit.location.country}</p>
          <div className="hit-skills">
            {hit.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="hit-skill">{skill.name}</span>
            ))}
          </div>
          {hit.stage && (
            <p className="hit-stage"><FaUserTie /> Status: {hit.stage}</p>
          )}
          <div className="hit-actions">
          <button className="view-cv-button" onClick={(e) => {viewCV(e, hit)}}>
            <FaFileAlt /> Get CV
          </button>
          {
            hit?.social_profiles?.find(item => item.type === 'linkedin' && item.url)?
            <button className="track-candidate-button" onClick={(e) => trackCandidate(e, hit.social_profiles?.find(item => item.type === 'linkedin' && item.url))}>
            <FaUserPlus /> Track Candidate
          </button>:<></>
          }
          
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            <CandidateCard candidate={hit} />
          </div>
        </div>
      )}
    </>
  );
}
function CustomSearchBox({ currentRefinement, refine }) {
  return (
    <form noValidate action="" role="search" className="custom-search-box">
      <input
        type="search"
        value={currentRefinement}
        onChange={event => refine(event.currentTarget.value)}
        placeholder="Search for candidates..."
      />
      <button type="submit" onClick={(e) => { e.preventDefault(); refine(currentRefinement); }}>
        <FaSearch />
      </button>
    </form>
  );
}
function CustomStats() {
  const { nbHits, processingTimeMS } = useStats();

  return (
    <div className="custom-stats">
      <span className="custom-stats__number">{nbHits.toLocaleString()}</span>
      <span className="custom-stats__text">matches found</span>
      <span className="custom-stats__time">in {processingTimeMS}ms</span>
    </div>
  );
}

function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [showDashboard, setShowDashboard] = useState(true);


  return (
    <div className="app">
      
      <header className="header">
        <img 
          src={Logo}
          alt="2070Health Logo" 
          className="header-logo"
        />
        <h1 className="header-title">W-Health Talent Search</h1>
      </header>

      <div className="tab-container">
      <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <FaSearch /> Talent Search
        </button>
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        
      </div>
      {activeTab === 'search' && <SearchTab filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} />}
      {activeTab === 'dashboard' && showDashboard && (
        <SupersetDashboard onClose={() => setShowDashboard(false)} />
      )}
      {activeTab === 'dashboard' && !showDashboard && (
        <button onClick={() => setShowDashboard(true)}>Show Dashboard</button>
      )}
      
    </div>
  );
}

export default App;