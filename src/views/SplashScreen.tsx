import React from 'react';
import './SplashScreen.css';

export const SplashScreen: React.FC = () => {
  return (
    <div className="gf-splash">
      <div className="logo" aria-label="GradeFlow logo">
        <span className="tile tl" />
        <span className="tile tr" />
        <span className="tile br" />
        <span className="tile bl" />
      </div>

      <h1 className="wordmark">
        <span className="grade">GRADE</span>
        <span className="flow">flow.</span>
      </h1>
      <p className="tagline">
        Your academic life, <span className="in-flow">in flow.</span>
      </p>

      <div className="loader" role="progressbar" aria-label="Loading" />
      <div className="version">v2.4.0 &bull; Synchronizing</div>
    </div>
  );
};
