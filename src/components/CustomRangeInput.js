import React, { useState, useEffect } from 'react';
import { useRange } from 'react-instantsearch';
import MultiRangeSlider from "multi-range-slider-react";

function CustomRangeInput(props) {
  const { start, range, canRefine, refine } = useRange(props);
  const [localRange, setLocalRange] = useState({
    min: start[0] !== -Infinity ? start[0] : range.min,
    max: start[1] !== Infinity ? start[1] : range.max,
  });

  useEffect(() => {
    if (canRefine) {
      setLocalRange({
        min: start[0] !== -Infinity ? start[0] : range.min,
        max: start[1] !== Infinity ? start[1] : range.max,
      });
    }
  }, [canRefine, range.min, range.max, start]);

  const handleInput = (e) => {
    setLocalRange({
      min: e.minValue,
      max: e.maxValue,
    });
  };

  const handleChange = (e) => {
    refine([e.minValue, e.maxValue]);
  };

  if (!canRefine) return null;

  return (
    <div className="custom-range-input">
      <MultiRangeSlider
        min={range.min}
        max={range.max}
        step={1}
        minValue={localRange.min}
        maxValue={localRange.max}
        onInput={handleInput}
        onChange={handleChange}
        label={false}
        ruler={false}
        style={{ border: "none", boxShadow: "none",  padding: "15px 10px" }}
        barLeftColor="#ddd"
        barRightColor="#ddd"

      />
      <div className="range-feedback">
        Experience: {localRange.min.toFixed(0)} - {localRange.max.toFixed(0)} years
      </div>
    </div>
  );
}

export default CustomRangeInput;