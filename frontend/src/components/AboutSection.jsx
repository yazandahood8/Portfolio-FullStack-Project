// src/components/AboutSection.jsx
import React, { useState } from 'react';

export default function AboutSection({ about }) {
  const [expanded, setExpanded] = useState(false);
  const charLimit = 300;

  if (!about || !about.trim()) {
    return (
      <section className="profile-section">
        <h2 className="profile-section-title">About</h2>
        <p>No about information provided yet.</p>
      </section>
    );
  }

  const isLong = about.length > charLimit;
  const displayText =
    !expanded && isLong
      ? about.slice(0, charLimit) + '...'
      : about;

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">About</h2>
      <p style={{ whiteSpace: 'pre-line' }}>
        {displayText}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="ml-2 text-blue-600 underline bg-transparent border-0 cursor-pointer"
            style={{ fontSize: '1em', padding: 0 }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
    </section>
  );
}
