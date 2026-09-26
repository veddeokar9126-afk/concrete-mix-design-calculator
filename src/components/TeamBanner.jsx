/** The institute banner, and the group card that sits below it, on screen and on the report. */
import React from 'react';
import { INSTITUTE, GROUP, MEMBERS } from '../lib/team.js';
import logo from '../assets/iit-mandi-logo.png';

export default function TeamBanner({ className = '' }) {
  return (
    <div className={`team ${className}`}>
      <div className="team-inner">
        <div className="team-inst">
          <img className="team-logo" src={logo} alt="IIT Mandi logo" />
          <div>
            <div className="team-hindi" lang="hi">{INSTITUTE.nameHindi}</div>
            <div className="team-name">{INSTITUTE.name}</div>
            <div className="team-addr">{INSTITUTE.address}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamMembers({ className = '' }) {
  return (
    <div className={`team-group ${className}`}>
      <span className="team-no">{GROUP}</span>
      <ol className="team-members">
        {MEMBERS.map((m) => (
          <li key={m.roll}>
            <span className="team-member">{m.name}</span>
            <span className="team-roll">{m.roll}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
