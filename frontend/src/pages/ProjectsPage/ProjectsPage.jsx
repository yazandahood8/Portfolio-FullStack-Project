// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchProjects, createProject } from '../../api/projects';
import client from '../../api/client';
import './ProjectsPage.scss';

// Helper for image upload
async function uploadImage(formData) {
  const { data } = await client.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

// Helper: display preview with full host for relative URLs
const getPreviewUrl = (url) =>
  url && !url.startsWith('http') ? `http://localhost:3000${url}` : url;

// Helper: for backend, only prefix if non-empty and not already full URL
const makeFullUrl = (url) =>
  url && !url.startsWith('http') ? `http://localhost:3000${url}` : url;

const emptyProject = {
  project_name: '',
  short_description: '',
  long_description: '',
  thumbnail_url: '',
  github_url: '',
  live_url: '',
  tech_stack: [],
  priority: 0,
  video_url: ''
};

export default function ProjectsPage() {
  const { userId } = useParams();
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filterTech, setFilterTech] = useState('All');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyProject });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Tech Stack string input (comma-separated)
  const [techStackInput, setTechStackInput] = useState('');

  // Thumbnail upload state
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [thumbUploading, setThumbUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await fetchProjects(userId);
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, userId]);

  // Modal open/close
  const openModal = () => {
    setShowModal(true);
    setForm({ ...emptyProject });
    setTechStackInput('');
    setThumbFile(null);
    setThumbPreview('');
    setFormError('');
    setFormLoading(false);
    setThumbUploading(false);
  };
  const closeModal = () => {
    setShowModal(false);
    setFormError('');
    setFormLoading(false);
    setThumbUploading(false);
    setThumbFile(null);
    setThumbPreview('');
  };

  // Handle file or URL input for thumbnail
  const handleThumbChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
    setThumbUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await uploadImage(formData);
      setForm(f => ({ ...f, thumbnail_url: data.url })); // Store as returned
      setThumbUploading(false);
    } catch (err) {
      setFormError('Image upload failed.');
      setThumbUploading(false);
    }
  };

  // Handle any field change
  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name === 'tech_stack') {
      setForm(f => ({
        ...f,
        tech_stack: value.split(',').map(t => t.trim()).filter(Boolean)
      }));
      setTechStackInput(value);
    } else if (name === 'priority') {
      setForm(f => ({
        ...f,
        priority: value === '' ? 0 : Number(value)
      }));
    } else if (name === 'thumbnail_url') {
      setForm(f => ({ ...f, thumbnail_url: value }));
      setThumbFile(null);
      setThumbPreview(value);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Submit new project
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      // Clean URLs: if blank, send null; otherwise, ensure full URL
      const cleanUrl = url => url ? makeFullUrl(url) : null;
      const payload = {
        ...form,
        thumbnail_url: cleanUrl(form.thumbnail_url),
        github_url: cleanUrl(form.github_url),
        live_url: cleanUrl(form.live_url),
        video_url: cleanUrl(form.video_url)
      };
      // Remove possible undefined or extra props
      Object.keys(payload).forEach(k => {
        if (payload[k] === undefined) delete payload[k];
      });

      const { data: newProj } = await createProject(userId, payload);
      setProjects(p => [newProj, ...p]);
      closeModal();
    } catch (err) {
      setFormError('Failed to add project.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="projects-bg min-h-screen flex-center">
        <div className="projects-card glass-card">
          <p>Please log in to view projects.</p>
        </div>
      </div>
    );
  }

  // Collect unique tech list
 const allTechs = Array.from(
  new Set(
    projects.flatMap(p => (p.tech_stack ? p.tech_stack.map(t => t.trim().toLowerCase()) : []))
  )
).map(t => t.charAt(0).toUpperCase() + t.slice(1)) // Capitalize first letter
 .sort();

  // Filtered projects
  const filteredProjects =
    filterTech === 'All'
      ? projects
      : projects.filter(
          proj =>
            proj.tech_stack &&
            proj.tech_stack.some(
              tech => tech.toLowerCase() === filterTech.toLowerCase()
            )
        );

  return (
    <div className="projects-bg min-h-screen flex-center">
      <div className="projects-main-card">
        <h1 className="projects-title">Projects</h1>

        {/* Dropdown filter */}
        {allTechs.length > 0 && (
          <div className="projects-filter">
            <label style={{ marginRight: 8, fontWeight: 600 }}>Filter:</label>
            <select
              value={filterTech}
              onChange={e => setFilterTech(e.target.value)}
              className="filter-select"
            >
              <option value="All">All</option>
              {allTechs.map((tech, idx) => (
                <option key={idx} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && <p className="projects-loading">Loading projects…</p>}
        {error && <p className="projects-error">{error}</p>}
        {!loading && filteredProjects.length === 0 && (
          <p className="projects-empty">No projects found.</p>
        )}
        <div className="projects-grid">
          {filteredProjects.map(proj => (
            <div key={proj.id} className="project-card">
              {proj.thumbnail_url && (
                <img
                  src={getPreviewUrl(proj.thumbnail_url)}
                  alt={proj.project_name}
                  className="project-thumb"
                />
              )}
              <h2 className="project-title">{proj.project_name}</h2>
              {proj.short_description && (
                <p className="project-desc">{proj.short_description}</p>
              )}
              {proj.tech_stack && proj.tech_stack.length > 0 && (
                <div className="project-badges">
                  {proj.tech_stack.map((tech, i) => (
                    <span key={i} className="project-badge">{tech}</span>
                  ))}
                </div>
              )}
              <div className="project-links">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn github"
                  >
                    GitHub
                  </a>
                )}
                {proj.live_url && (
                  <a
                    href={proj.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn live"
                  >
                    Live
                  </a>
                )}
                {proj.video_url && (
                  <a
                    href={proj.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn video"
                  >
                    Video
                  </a>
                )}
                <Link
                  to={`/projects/${userId}/${proj.id}`}
                  className="project-btn details"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        {/* Floating Add Project Button */}
        <button
          className="add-project-fab"
          onClick={openModal}
          aria-label="Add Project"
        >
          ＋
        </button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="projects-modal-backdrop" onClick={closeModal}>
          <div className="projects-modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add Project</h2>
            {formError && <div className="modal-error">{formError}</div>}
            <form className="modal-form" onSubmit={handleSubmit} autoComplete="off">
              <label>
                <span>Project Name *</span>
                <input
                  type="text"
                  name="project_name"
                  className="modal-input"
                  required
                  maxLength={150}
                  value={form.project_name}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Short Description</span>
                <textarea
                  name="short_description"
                  className="modal-input"
                  maxLength={300}
                  value={form.short_description}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Long Description</span>
                <textarea
                  name="long_description"
                  className="modal-input"
                  value={form.long_description}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Thumbnail Image</span>
                <div className="thumbnail-input-row">
                  <input
                    type="file"
                    accept="image/*"
                    className="modal-input"
                    style={{padding:0}}
                    onChange={handleThumbChange}
                    disabled={thumbUploading}
                  />
                  <span style={{ marginInline: 8, color: '#c2f2ff', fontWeight: 600 }}>or</span>
                  <input
                    type="text"
                    name="thumbnail_url"
                    className="modal-input"
                    value={form.thumbnail_url}
                    placeholder="Paste image URL"
                    onChange={handleFormChange}
                    disabled={thumbUploading}
                  />
                </div>
                {(thumbPreview || form.thumbnail_url) && (
                 <img
  src={
    thumbPreview
      ? thumbPreview
      : form.thumbnail_url
        ? form.thumbnail_url.startsWith('/uploads/')
          ? `http://localhost:3000${form.thumbnail_url}`
          : form.thumbnail_url
        : ''
  }
  alt="Thumbnail preview"
  className="thumbnail-preview"
  style={{ maxWidth: 120, maxHeight: 80, marginTop: 8 }}
/>
                )}
                {thumbUploading && <div style={{color:'#aafaff',fontWeight:600}}>Uploading…</div>}
              </label>
              <label>
                <span>GitHub URL</span>
                <input
                  type="text"
                  name="github_url"
                  className="modal-input"
                  value={form.github_url}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Live URL</span>
                <input
                  type="text"
                  name="live_url"
                  className="modal-input"
                  value={form.live_url}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Tech Stack <small>(comma separated)</small> *</span>
                <input
                  type="text"
                  name="tech_stack"
                  className="modal-input"
                  required
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  value={techStackInput}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Priority</span>
                <input
                  type="number"
                  name="priority"
                  min="0"
                  className="modal-input"
                  value={form.priority}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Video URL</span>
                <input
                  type="text"
                  name="video_url"
                  className="modal-input"
                  value={form.video_url}
                  onChange={handleFormChange}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={closeModal} disabled={formLoading || thumbUploading}>Cancel</button>
                <button type="submit" className="modal-btn submit" disabled={formLoading || thumbUploading}>
                  {formLoading ? 'Adding…' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
