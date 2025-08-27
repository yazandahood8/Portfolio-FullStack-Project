// src/pages/UserDetailPage/UserDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUser } from '../../api/users';
import { fetchSkills } from '../../api/skills';
import useAuth from '../../hooks/useAuth';
import useCardTilt from '../../hooks/useCardTilt';
import AboutSection from '../../components/AboutSection';  
import './UserDetailPage.css';

const Sparkles = () => (
  <div className="c-sparkle" aria-hidden="true">
    <span /><span /><span /><span /><span />
  </div>
);

export default function UserDetailPage() {
  const { userId } = useParams();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardTiltRef = useCardTilt(13); // Premium parallax!

  useEffect(() => {
      const FALLBACK_USER_ID = 'c05a246c-8751-47ca-af16-ae92d1dff4e8';

       const effectiveId = isAuthenticated ? (userId || FALLBACK_USER_ID) : FALLBACK_USER_ID;

    const load = async () => {
      try {
        const { data: userData } = await fetchUser(effectiveId);
        const { data: skillsData } = await fetchSkills(effectiveId);

        setProfile(userData);
        setSkills(skillsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex-center">
        <p>Loading user info…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex-center">
        <p>Could not load user information.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen profile-bg">
      <div className="userdetail-card" ref={cardTiltRef} tabIndex={0}>
        {/* --- Sparkles Layer (for premium effect) --- */}
        <Sparkles />

        {/* Profile Header */}
        <div className="profile-header position-relative">
          <img
            src={profile.profile_image_url || '/profile.jpg'}
            alt={profile.full_name}
            className="profile-avatar"
          />
          <div>
            <h1 className="profile-name">{profile.full_name}</h1>
            <ul className="profile-info-list">
              <li><span className="profile-info-label">Email:</span> {profile.email}</li>
              {profile.phone && <li><span className="profile-info-label">Phone:</span> {profile.phone}</li>}
              {profile.location && <li><span className="profile-info-label">Location:</span> {profile.location}</li>}
            </ul>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <section className="profile-section">
            <h2 className="profile-section-title">Bio</h2>
            <p>{profile.bio}</p>
          </section>
        )}

        <AboutSection about={profile.about} />

        <section className="profile-section">
          <h2 className="profile-section-title">Connect</h2>
          <div className="profile-socials">
            {profile.social_links && profile.social_links.length > 0 ? (
              profile.social_links.map(link => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-btn ${link.platform}`}
                >
                  {link.display_name || link.platform}
                </a>
              ))
            ) : (
              <span className="profile-empty">No social links.</span>
            )}
          </div>
        </section>

        {/* Skills */}
        <section className="profile-section">
          <h2 className="profile-section-title">Technical Skills</h2>
          {skills.length > 0 ? (
            <ul className="skills-list">
              {skills.map(skill => (
                <li key={skill.id} className="skill-item">
                  <div className="skill-name-row">
                    <span className={`skill-level-dot ${skill.level.toLowerCase()}`} title={skill.level}></span>
                    <span className="skill-title">{skill.skill_name}</span>
                    <span className="skill-level-label">{skill.level}</span>
                  </div>
                  <span className="skill-category">{skill.category}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile-empty">No skills added.</p>
          )}
        </section>
      </div>
    </div>
  );
}
