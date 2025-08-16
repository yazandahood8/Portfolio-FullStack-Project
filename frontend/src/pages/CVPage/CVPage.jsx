import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import client from '../../api/client';
import { fetchSkills } from '../../api/skills';
import { fetchExperiences } from '../../api/experiences';
import { fetchEducations } from '../../api/educations';
import { fetchProjects } from '../../api/projects';
import { fetchCertifications } from '../../api/certifications';
import { fetchVolunteerings } from '../../api/volunteerings';
import './CVPage.css';

export default function CVPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);

  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [volunteerings, setVolunteerings] = useState([]);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    setError('');

    const fetchAll = async () => {
      try {
        const [
          { data: userData },
          { data: educData },
          { data: skillsData },
          { data: experiencesData },
          { data: projData },
          { data: certificationsData },
          { data: volunteeringsData },
          pdfRes
        ] = await Promise.all([
          client.get(`/users/${user.id}`),
          fetchEducations(user.id),
          fetchSkills(user.id),
          fetchExperiences(user.id),
          fetchProjects(user.id),
          fetchCertifications(user.id),
          fetchVolunteerings(user.id),

          //client.get(`/users/${user.id}/cv`, { responseType: 'blob' }),
           client.get(`/users/${user.id}/cvAiPdf`, { responseType: 'blob' })

        ]);
        // console.log('educData Data:', educData);
      //   console.log('certificationsData Data:', certificationsData);
        setProfile(userData);
        setEducations(Array.isArray(educData.data) ? educData.data : []);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setExperiences(Array.isArray(experiencesData) ? experiencesData : []);
        setProjects(Array.isArray(projData) ? projData : []);
        setCertifications(Array.isArray(certificationsData.data) ? certificationsData.data : []);
        setVolunteerings(Array.isArray(volunteeringsData.data) ? volunteeringsData.data : []);

        const url = window.URL.createObjectURL(
          new Blob([pdfRes.data], { type: 'application/pdf' })
        );
        setBlobUrl(url);
      } catch (err) {
        console.error(err);
        setError('Failed to load your CV or details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line
  }, [isAuthenticated, user?.id]);

  const downloadCV = () => {
    if (!blobUrl || !user) return;
    const baseName = user.full_name ? user.full_name.replace(/\s+/g, '_') : user.id;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `${baseName}_CV.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const fetchPDF = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await client.get(`/users/${user.id}/cvAiPdf`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    setBlobUrl(URL.createObjectURL(blob));
  } catch (err) {
    setError('Failed to fetch PDF.');
  } finally {
    setLoading(false);
  }
};
const handleRegenerateCV = async () => {
  if (!user?.id) return;
  setLoading(true);
  setError('');
  try {
    // POST request to the new backend endpoint
    await client.post(`/users/${user.id}/cvAiPdf/regenerate`);
    // Optionally: download/show fresh PDF automatically
    await fetchPDF(); // Your existing logic to fetch PDF and set blobUrl
  } catch (err) {
    setError('Failed to regenerate CV. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (!isAuthenticated) {
    return (
      <div className="cv-bg min-h-screen flex-center">
        <div className="cv-card glass-card">
          <p>Please log in to view your CV.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cv-bg min-h-screen flex-center">
      <div className="cv-card glass-card">
        <h1 className="cv-title">My CV</h1>
        {loading && <p className="cv-loading">Loading CV…</p>}
        {error && <p className="cv-error">{error}</p>}

        {/* --- Profile Info --- */}
        {profile && (
          <div className="cv-profile-header">

            <img
              src={profile.data.profile_image_url || "/profile.jpg"}
              alt={profile.data.full_name}
              className="cv-profile-avatar"
              width={96}
              height={96}
            />
            <div>
              <h2 className="cv-profile-name">{profile.full_name}</h2>
              <div className="cv-profile-meta">
                {profile.email && <span>{profile.email}</span>}
                {profile.phone && <span> | {profile.phone}</span>}
                {profile.location && <span> | {profile.location}</span>}
              </div>
              {profile.bio && <p className="cv-profile-bio">{profile.bio}</p>}
            </div>
          </div>
        )}

        {/* --- Education Section --- */}
        <section className="cv-section">
          <h3 className="cv-section-title">Education</h3>
          {educations.length > 0 ? (
            <ul className="cv-list">
              {educations.map((edu) => (
                <li key={edu.id} className="cv-list-item">
                  <strong>{edu.school_name}</strong>
                  {edu.degree && <> — {edu.degree}</>}
                  <br />
                  <span className="cv-list-dates">
                    {edu.start_date?.substring(0, 10) || edu.start_year} - {edu.end_date?.substring(0, 10) || edu.end_year || 'Present'}
                  </span>
                  {edu.field_of_study && <> | <span>{edu.field_of_study}</span></>}
                  {edu.description && <p>{edu.description}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="cv-empty">No education records.</p>}
        </section>

        {/* --- Experience Section --- */}
        <section className="cv-section">
          <h3 className="cv-section-title">Experience</h3>
          {experiences.length > 0 ? (
            <ul className="cv-list">
              {experiences.map((exp) => (
                <li key={exp.id} className="cv-list-item">
                  <strong>{exp.job_title}</strong> at <strong>{exp.company_name}</strong>
                  {exp.location && <> — {exp.location}</>}
                  <br />
                  <span className="cv-list-dates">
                    {exp.start_date?.substring(0, 10)} - {exp.is_current ? 'Present' : exp.end_date?.substring(0, 10)}
                  </span>
                  {exp.description && <p>{exp.description}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="cv-empty">No experience records.</p>}
        </section>

        {/* --- Projects Section --- */}
        <section className="cv-section">
          <h3 className="cv-section-title">Projects</h3>
          {projects.length > 0 ? (
            <ul className="cv-list">
              {projects.map((proj) => (
                <li key={proj.id} className="cv-list-item">
                  <strong>{proj.project_name}</strong>
                  {proj.short_description && <> — {proj.short_description}</>}
                  <br />
                  {proj.long_description && <p>{proj.long_description}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="cv-empty">No projects added.</p>}
        </section>

        {/* --- Skills Section --- */}
        <section className="cv-section">
          <h3 className="cv-section-title">Skills</h3>
          {skills.length > 0 ? (
            <ul className="cv-skills-list">
              {skills.map((skill) => (
                <li key={skill.id} className="cv-skill-item">
                  <span className={`cv-skill-dot ${skill.level ? skill.level.toLowerCase() : 'beginner'}`}></span>
                  <span className="cv-skill-title">{skill.skill_name}</span>
                  <span className="cv-skill-level">{skill.level}</span>
                  <span className="cv-skill-category">{skill.category}</span>
                </li>
              ))}
            </ul>
          ) : <p className="cv-empty">No skills added.</p>}
        </section>

        {/* --- Certifications Section --- */}
          <section className="cv-section">
            <h2 className="cv-section-title">Licenses & Certifications</h2>
            {certifications.length > 0 ? (

            <ul className="cv-skills-list">
              {certifications.map(cert => (
                <li key={cert.id} className="item-entry">
                  <div className="item-content">
                    <span className="item-title">{cert.name} - {cert.organization}</span>
                    <span className="item-subtitle">{cert.issued_date?.substring(0, 10)}{cert.expiration_date ? ` - ${cert.expiration_date.substring(0, 10)}` : ''}</span>
                  </div>
                  
                </li>
              ))}
            </ul>
            ) : <p className="cv-empty">No certifications added.</p>}
          </section>

          {/* VOLUNTEERING */}
          <section>
            <div className="cv-section-title">
              <h2 className="cv-section-title">Volunteering</h2>
            </div>
            {volunteerings.length > 0 ? (

            <ul className="item-list">

              {volunteerings.map(vol => (
                <li key={vol.id} className="item-entry">
                  <div className="item-content">
                    <span className="item-title">{vol.role} at {vol.organization}</span>
                    <span className="item-subtitle">{vol.start_date?.substring(0, 10)} – {vol.end_date ? vol.end_date.substring(0, 10) : 'Present'}</span>
                    <span className="item-subtitle">{vol.description}</span>
                  </div>
                  
                </li>
              ))}
            </ul>
            ) : <p className="cv-empty">No volunteering added.</p>}
          </section>

        {/* --- CV PDF Buttons --- */}
        <div className="cv-btn-row">
          <button
            onClick={downloadCV}
            className="cv-download-btn"
            disabled={loading || !blobUrl}
          >
            Download PDF
          </button>
          <button
            onClick={() => setShowPDF((prev) => !prev)}
            className="cv-show-btn"
            disabled={loading || !blobUrl}
          >
            {showPDF ? "Hide PDF" : "Show PDF"}
          </button>
          <button
            onClick={handleRegenerateCV}
            className="cv-show-btn"
            disabled={loading}
            style={{ marginLeft: 12 }}
          >
            Regenerate PDF
          </button>
        </div>

        {/* --- PDF Viewer --- */}
        {!loading && showPDF && blobUrl && (
          <object
            data={blobUrl}
            type="application/pdf"
            width="100%"
            height="680px"
            className="cv-pdf-viewer"
          >
            <p>
              Your browser doesn’t support inline PDFs. You can{' '}
              <a
                href={blobUrl}
                download={`${user.full_name ?? user.id}_CV.pdf`}
                className="cv-link"
              >
                download the PDF here
              </a>.
            </p>
          </object>
        )}
      </div>
    </div>
  );
}
