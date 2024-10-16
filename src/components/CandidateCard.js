import React from 'react';
import { FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa';
import './CandidateCard.css';

const CandidateCard = ({ candidate }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="candidate-card">
      <div className="candidate-header">
        <div className="candidate-avatar">
          {candidate.image_url ? (
            <img src={candidate.image_url} alt={candidate.name} />
          ) : (
            <div className="candidate-initials">{getInitials(candidate.name)}</div>
          )}
        </div>
        <div className="candidate-name-title">
          <h2>{candidate.name}</h2>
          <p>{candidate.job_title}</p>
        </div>
      </div>

      <div className="candidate-info">
        <p><FaEnvelope /> {candidate.email}</p>
        <p><FaPhone /> {candidate.phone}</p>
        <p><FaMapMarkerAlt /> {candidate.location.location_str}</p>
        <p><FaUserTie /> Stage: {candidate.stage}</p>
      </div>
      
      <div className="candidate-section">
        <h3><FaBriefcase /> Experience</h3>
        <ul>
          {candidate.experience.map((exp, index) => (
            <li key={index}>
              <strong>{exp.title}</strong> at {exp.company}<br />
              {new Date(exp.startdate).getMonth()+"/"+new Date(exp.startdate).getFullYear()} - 
              {exp.enddate ? new Date(exp.enddate).getMonth()+"/"+new Date(exp.enddate ).getFullYear() : 'Present'}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="candidate-section">
        <h3><FaGraduationCap /> Education</h3>
        <ul>
          {candidate.education_entries.map((edu, index) => (
            <li key={index}>
              <strong>{edu.degree}</strong> in {edu.field_of_study}<br />
              {edu.school}
              {edu.end_date && ` (${new Date(edu.end_date).getFullYear()})`}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="candidate-section">
        <h3>Tags</h3>
        <div className="candidate-tags">
          {candidate.enriched_tags.map((tag, index) => (
            <span key={index} className="candidate-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;