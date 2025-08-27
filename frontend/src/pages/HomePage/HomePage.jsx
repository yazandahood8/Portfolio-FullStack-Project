// src/pages/HomePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { fetchUser } from '../../api/users';
import useCardTilt from '../../hooks/useCardTilt';   // << NEW HOOK!
import './HomePage.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

// Sparkles component (CSS only, absolutely positioned inside card)
const Sparkles = () => (
  <div className="c-sparkle" aria-hidden="true">
    <span /><span /><span /><span /><span />
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardTiltRef = useCardTilt(13); // parallax intensity: 8-20 looks best

 useEffect(() => {
  let alive = true;

  const ownerFallback = 'c05a246c-8751-47ca-af16-ae92d1dff4e8';
  const envOwner =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OWNER_ID) ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_OWNER_ID);
  const viewedUserId = user?.id || envOwner || ownerFallback;

  if (!viewedUserId) {
    setLoading(false);
    return;
  }

  (async () => {
    setLoading(true);
    try {
      const { data } = await fetchUser(viewedUserId);
      if (alive) setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
      if (alive) setProfile(null);
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => {
    alive = false;
  };
}, [user?.id]);

  if (loading) {
    return (
      <main className="l-center">
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="l-center">
        <p className="text-danger fw-semibold">Unable to load profile.</p>
      </main>
    );
  }

  return (
    <main className="l-center bg-body-tertiary px-3 px-md-4">
      <article
        ref={cardTiltRef}
        className="c-profile-card shadow-lg rounded-4 text-center p-4 p-md-5"
        tabIndex={0}
        aria-label="User profile card"
        style={{ transition: 'transform .35s cubic-bezier(.23,1,.32,1)' }}
      >
        {/* Animated sparkles */}
        <Sparkles />

        {/* Avatar with triple-glow/shines */}
        <div className="c-profile-card__avatar-wrap mb-2 mx-auto position-relative">
          <img
            src={profile.profile_image_url || '/profile.jpg'}
            alt={profile.full_name}
            className="c-profile-card__avatar shadow-sm"
            width={144}
            height={144}
            draggable="false"
          />
        </div>

        <h1 className="h2 fw-bold mt-3 mb-1">{profile.full_name}</h1>
        <p className="text-muted mb-4">{profile.bio || 'No bio available.'}</p>

        <nav aria-label="Social links">
          <ul className="list-unstyled d-flex justify-content-center gap-2 mb-0">
            {profile.github_url && (
              <li>
                <a
                  className="btn btn-dark px-3 py-2"
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </li>
            )}
            {profile.linkedin_url && (
              <li>
                <a
                  className="btn btn-primary px-3 py-2"
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            )}
            {profile.youtube_url && (
              <li>
                <a
                  className="btn btn-danger px-3 py-2"
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </a>
              </li>
            )}
          </ul>
        </nav>
      </article>
    </main>
  );
}
