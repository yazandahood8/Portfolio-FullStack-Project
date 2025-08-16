import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import './ProjectDetailPage.scss';

function getImagePreviewUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `http://localhost:3000${url}`;
  return url;
}

export default function ProjectDetailPage() {
  const { userId, projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get(`/users/${userId}/projects/${projectId}`);

        setProject(data.data);
      } catch (err) {
        setError('Project not found.');
      }
    }
    load();
  }, [userId, projectId]);

  if (error) return <div className="project-detail-bg">{error}</div>;
  if (!project) return <div className="project-detail-bg">Loading…</div>;

  return (
    <div className="project-detail-bg">
      <div className="project-detail-card">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <h1 className="project-detail-title">{project.project_name}</h1>
        <div className="project-detail-meta">
          {project.thumbnail_url && (
            <img
              className="project-detail-thumb"
              src={getImagePreviewUrl(project.thumbnail_url)}
              alt={project.project_name}
            />
          )}
        </div>
        <div className="project-detail-section">
          <strong>Short Description:</strong>
          <div className="project-detail-text">{project.short_description || <em>No description.</em>}</div>
        </div>
        <div className="project-detail-section">
          <strong>Long Description:</strong>
          <div className="project-detail-text">{project.long_description || <em>No long description.</em>}</div>
        </div>
        <div className="project-detail-section">
          <strong>Tech Stack:</strong>
          <div className="project-detail-badges">
            {(project.tech_stack && project.tech_stack.length > 0)
              ? project.tech_stack.map((tech, i) => (
                  <span key={i} className="project-detail-badge">{tech}</span>
                ))
              : <em>None specified.</em>
            }
          </div>
        </div>
        <div className="project-detail-section">
          <strong>Links:</strong>
          <div className="project-detail-links">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="project-detail-btn github">GitHub</a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="project-detail-btn live">Live</a>
            )}
            {project.video_url && (
              <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="project-detail-btn video">Video</a>
            )}
          </div>
        </div>
        <div className="project-detail-section">
          <strong>Priority:</strong> <span>{project.priority}</span>
        </div>
        <div className="project-detail-section">
          <strong>Project ID:</strong> <span style={{ fontFamily: 'monospace' }}>{project.id}</span>
        </div>
      </div>
    </div>
  );
}
