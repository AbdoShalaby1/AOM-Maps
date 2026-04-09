/**
 * CountryTooltip Component
 * Displays country name tooltip on hover
 */

import React from 'react';
import './CountryTooltip.css';
import type {CountryTooltipProps} from '../types/CountryTooltipProps';

const CountryTooltip: React.FC<CountryTooltipProps> = ({
  visible,
  countryName,
  x,
  y
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="country-tooltip"
      style={{
              // position starts from the left side
              // each px you add is the distance between the left border of the screen
              // and the left border of the div itself
              // you get the Min because
              // if the location is > screen size it places it in a safe place
              left: `${Math.min(x + 15, window.innerWidth - 160)}px`, 
              top: `${Math.min(y + 15, window.innerHeight - 60)}px`,
              display: visible ? 'block' : 'none'
            }}
    >
      {countryName}
    </div>
  );
};

export default CountryTooltip;
