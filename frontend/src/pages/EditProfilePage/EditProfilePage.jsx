import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  fetchUser, updateUser,
} from '../../api/users';
import {
  fetchProjects, createProject, updateProject, deleteProject,
} from '../../api/projects';
import {
  fetchExperiences, createExperience, updateExperience, deleteExperience,
} from '../../api/experiences';
import {
  fetchEducations, createEducation, updateEducation, deleteEducation,
} from '../../api/educations';
import {
  fetchSkills, createSkill, updateSkill, deleteSkill,
} from '../../api/skills';

import {
  fetchCertifications, createCertification, updateCertification, deleteCertification,
} from '../../api/certifications';
import {
  fetchVolunteerings, createVolunteering, updateVolunteering, deleteVolunteering,
} from '../../api/volunteerings';
import client from '../../api/client';
// The CSS from the <style> block below should be linked here
import './EditProfilePage.css';

// Reusable, accessible modal component
const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.target.classList.add('closing');
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};


export default function EditProfilePage() {
  // --- Core State ---
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- Profile State ---
  const [profileForm, setProfileForm] = useState({
    full_name: '', phone: '', location: '', bio: '', about: ''
  });
  const [profileImgUrl, setProfileImgUrl] = useState(null);

  // --- Image Upload State ---
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);
  const fileInputRef = useRef();

  // --- Data State ---
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [volunteerings, setVolunteerings] = useState([]);
  const unbox = (x) => x?.data?.data ?? x?.data ?? x;
  const ensureYMD = (v, allowNull = false) => {
    if (v === null) return allowNull ? null : '';
    if (v === undefined || v === '') return allowNull ? null : '';
    // אם זו מחרוזת ISO עם T – חותכים
    if (typeof v === 'string') {
      // "Thu Aug 21 2025" או דומה? ננסה לפרסר
      if (/^[A-Za-z]{3}/.test(v)) {
        const d = new Date(v);
        if (!isNaN(d)) {
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        }
        return allowNull ? null : '';
      }
      // "2025-09-02T21:00:00.000Z" או "2025-09-02"
      return v.slice(0, 10);
    }
    // Date אובייקט
    if (v instanceof Date && !isNaN(v)) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    }
    return allowNull ? null : '';
  };

  // --- Unified Modal State ---
  const [modalState, setModalState] = useState({
    skill: { isOpen: false, data: null },
    experience: { isOpen: false, data: null },
    education: { isOpen: false, data: null },

    project: { isOpen: false, data: null },
    certification: { isOpen: false, data: null },
    volunteering: { isOpen: false, data: null }
  });

  // --- Initial Data Load ---
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    //console.log("Current logged in user id:", user.id);

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: userData } = await fetchUser(user.id);
        setProfileForm({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          about: userData.about || ''
        });
        setProfileImgUrl(userData.profile_image_url || null);

        const [
          { data: skillsData },
          { data: experiencesData },
          { data: educationsData },

          { data: projectsData },
          { data: certificationsData },
          { data: volunteeringsData }
        ] = await Promise.all([
          fetchSkills(user.id),
          fetchExperiences(user.id),
          fetchEducations(user.id),

          fetchProjects(user.id),

          fetchCertifications(user.id),
          fetchVolunteerings(user.id)
        ]);

        // FIX: Ensure state is always set to an array with fallback `|| []`
        setSkills(skillsData || []);
        setExperiences(experiencesData || []);
        setEducations(educationsData.data || []);
    //    console.log(volunteeringsData);
        setProjects(projectsData || []);
        //  setEducations(Array.isArray(educationsData) ? educationsData : []);
        setCertifications(Array.isArray(certificationsData.data) ? certificationsData.data : []);
        setVolunteerings(Array.isArray(volunteeringsData.data) ? volunteeringsData.data : []);




      } catch (err) {
        console.error("Failed to load profile data:", err);
        // If an API call fails, ensure the state remains an array to prevent crashes
        setSkills([]);
        setExperiences([]);
        setEducations([]);

        setProjects([]);
        setCertifications([]);
        setVolunteerings([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => { if (preview) URL.revokeObjectURL(preview); };
    // eslint-disable-next-line
  }, [isAuthenticated, user, navigate]);

  // --- Generic Modal Handlers ---
  const openModal = (type, data = {}) => {
    if (type === 'project' && Array.isArray(data.tech_stack)) {
      data = { ...data, tech_stack: data.tech_stack.join(', ') };
    }
    if (type === 'education') {
      data = {
        ...data,
        // שדה התצוגה בטופס
        institution: data.institution ?? data.school_name ?? '',
        // קלט ל-input[type=date] חייב להיות YYYY-MM-DD
        start_date: ensureYMD(data.start_date) || '',
        end_date: ensureYMD(data.end_date) || '',
      };
    }
    if (type === 'experience') {
      data = {
        ...data,
        start_date: ensureYMD(data.start_date) || '',
        end_date: ensureYMD(data.end_date) || '',
      };
    }
    if (type === 'certification') {
      data = {
        ...data,
        // עובד עם שמות השדות של הטופס
        issue_date: ensureYMD(data.issue_date ?? data.issued_date) || '',
        expiration_date: ensureYMD(data.expiration_date) || '',
      };
    }
    if (type === 'volunteering') {
      data = {
        ...data,
        start_date: ensureYMD(data.start_date) || '',
        end_date: ensureYMD(data.end_date) || '',
      };
    }
    setModalState(prev => ({ ...prev, [type]: { isOpen: true, data } }));
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: { isOpen: false, data: null } }));
  };
  const handleModalFormChange = (e, type) => {
    const { name, value, type: inputType, checked } = e.target;
    let val = inputType === 'checkbox' ? checked : value;

    if (type === 'education' && (name === 'start_date' || name === 'end_date')) {
      val = ensureYMD(val) || '';
    }
    if (type === 'certification' && (name === 'issue_date' || name === 'expiration_date')) {
      val = ensureYMD(val) || '';
    }

    setModalState(prev => {
      const current = prev[type].data ?? {};
      const next = { ...current, [name]: val };
      if (type === 'education' && name === 'is_current' && checked) next.end_date = '';
      return { ...prev, [type]: { ...prev[type], data: next } };
    });
  };


  // --- Profile & Image Handlers ---
  const handleProfileChange = e => setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submitProfile = async e => { e.preventDefault(); await updateUser(user.id, profileForm); alert('Profile updated'); };
  const handleImageLabelClick = () => fileInputRef.current?.click();
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const cancelImage = () => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setImageFile(null); };

  // --- submitImage Function ---
  const submitImage = async () => {
    if (!imageFile) return;
    setImgUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Authentication error. Please log in again.');
        setImgUploading(false);
        navigate('/login');
        return;
      }
      const form = new FormData();
      form.append('image', imageFile);
      const { data } = await client.post(
        `/users/${user.id}/photo`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProfileImgUrl(data.data.profile_image_url);
      cancelImage();
      alert('Image uploaded!');
    } catch (err) {
      console.error(err);
      alert('Upload failed. The server responded with an error.');
    } finally {
      setImgUploading(false);
    }
  };

  // --- CRUD Handlers ---
  const handleSkillSubmit = async e => {
    e.preventDefault(); const { data } = modalState.skill;
    if (data.id) {
      const { data: updated } = await updateSkill(user.id, data.id, data);
      setSkills(skills.map(s => (s.id === data.id ? updated : s)));
    } else {
      if (!data.level) data.level = 'Beginner';
      const { data: created } = await createSkill(user.id, data);
      setSkills(skills.concat(created));
    } closeModal('skill');
  };
  const handleEducationSubmit = async (e) => {
    e.preventDefault();
    const d = modalState.education.data ?? {};

    // payload לבן בלבד + תאריכים תקינים
    const payload = {
      school_name: (d.institution ?? d.school_name ?? '').trim(),
      degree: (d.degree ?? '').trim(),
      field_of_study: (d.field_of_study ?? '').trim(),
      start_date: ensureYMD(d.start_date, true),                // null או YYYY-MM-DD
      end_date: d.is_current ? null : ensureYMD(d.end_date, true),
      is_current: !!d.is_current,
      description: (d.description ?? '').trim(),
    };

    try {
      if (d.id) {
        const res = await updateEducation(user.id, d.id, payload);
        const updated = unbox(res?.data ?? res);
        setEducations(educations.map(ed => (ed.id === d.id ? updated : ed)));
      } else {
        const res = await createEducation(user.id, payload);
        const created = unbox(res?.data ?? res);
        setEducations([...educations, created]);
      }
      closeModal('education');
    } catch (err) {
      console.error('Education upsert failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };
  

  const handleEducationDelete = async id => {
    const token = localStorage.getItem('accessToken');
    console.log('DELETE EDUCATION ID:', token);
    if (!window.confirm('Delete this education?')) return;
    await deleteEducation(user.id, id);
    setEducations(educations.filter(e => e.id !== id));
  };

  const handleSkillDelete = async id => {
    if (!window.confirm('Delete this skill?')) return;
    await deleteSkill(user.id, id);
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleExperienceDelete = async id => {
    if (!window.confirm('Delete this experience?')) return;
    await deleteExperience(user.id, id);
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleProjectDelete = async id => {
    if (!window.confirm('Delete this project?')) return;
    await deleteProject(user.id, id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleCertificationDelete = async id => {
    if (!window.confirm('Delete this certification?')) return;
    await deleteCertification(user.id, id);
    setCertifications(certifications.filter(c => c.id !== id));
  };

  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    const d = modalState.experience.data ?? {};

    // payload לבן בלבד
    const payload = {
      job_title: (d.job_title ?? '').trim(),
      company_name: (d.company_name ?? '').trim(),
      location: d.location ?? null, // אם אין — שלח null או השמט
      start_date: ensureYMD(d.start_date, true),                   // 'YYYY-MM-DD' או null
      end_date: d.is_current ? null : ensureYMD(d.end_date, true), // נקה אם נוכחי
      is_current: !!d.is_current,
      description: (d.description ?? '').trim(),
    };

    try {
      if (d.id) {
        const { data: updatedRes } = await updateExperience(user.id, d.id, payload);
        const updated = updatedRes?.data ?? updatedRes;
        setExperiences(experiences.map(exp => (exp.id === d.id ? updated : exp)));
      } else {
        const { data: createdRes } = await createExperience(user.id, payload);
        const created = createdRes?.data ?? createdRes;
        setExperiences(experiences.concat(created));
      }
      closeModal('experience');
    } catch (err) {
      console.error('Experience upsert failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };


  const handleProjectSubmit = async e => {
    e.preventDefault();
    let { data } = modalState.project;
    const tech_stack = typeof data.tech_stack === 'string'
      ? data.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
      : data.tech_stack || [];
    const payload = {
      project_name: data.project_name || "",
      short_description: data.short_description || "",
      long_description: data.long_description || "",
      thumbnail_url: data.thumbnail_url || "",
      github_url: data.github_url || "",
      live_url: data.live_url || "",
      tech_stack: tech_stack,
      priority: typeof data.priority === "number" ? data.priority : 0,
      video_url: data.video_url || ""
    };
    if (data.id) {
      const { data: updated } = await updateProject(user.id, data.id, payload);
      setProjects(projects.map(p => (p.id === data.id ? updated : p)));
    } else {
      const { data: created } = await createProject(user.id, payload);
      setProjects(projects.concat(created));
    }
    closeModal('project');
  };




  const handleCertificationSubmit = async (e) => {
    e.preventDefault();
    const d = modalState.certification.data ?? {};

    const payload = {
      name: (d.name ?? '').trim(),
      organization: (d.organization ?? '').trim(),
      issued_date: ensureYMD(d.issue_date, true),         // 'YYYY-MM-DD' או null
      expiration_date: ensureYMD(d.expiration_date, true),
      credential_id: (d.credential_id ?? '').trim() || null,
      credential_url: (d.credential_url ?? '').trim() || null,
    };

    try {
      if (d.id) {
        const res = await updateCertification(user.id, d.id, payload);
        const updated = unbox(res?.data ?? res);
        setCertifications(certifications.map(c => (c.id === d.id ? updated : c)));
      } else {
        const res = await createCertification(user.id, payload);
        const created = unbox(res?.data ?? res);
        setCertifications(certifications.concat(created));
      }
      closeModal('certification');
    } catch (err) {
      console.error('Certification upsert failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };




  const handleVolunteeringSubmit = async (e) => {
    e.preventDefault();
    const d = modalState.volunteering.data ?? {};

    const payload = {
      role: (d.role ?? '').trim(),
      organization: (d.organization ?? '').trim(),
      start_date: ensureYMD(d.start_date, true),
      end_date: ensureYMD(d.end_date, true),
      description: (d.description ?? '').trim(),
      is_current: !!d.is_current,
      location: d.location ?? '',
    };

    try {
      if (d.id) {
        const res = await updateVolunteering(user.id, d.id, payload);
        const updated = unbox(res);
        setVolunteerings(volunteerings.map(v => (v.id === d.id ? updated : v)));
      } else {
        console.log('CLIENT user.id:', user.id);
        const res = await createVolunteering(user.id, payload);
        const created = unbox(res);
        setVolunteerings([...volunteerings, created]); // ליציבות
      }
      closeModal('volunteering');
    } catch (err) {
      console.error('Volunteering upsert failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Save failed');
    }
  };
  const handleVolunteeringDelete = async id => {
    if (!window.confirm('Delete this volunteering experience?')) return;
    await deleteVolunteering(user.id, id);
    setVolunteerings(volunteerings.filter(v => v.id !== id));
  };


  if (loading) {
    return <p className="p-6">Loading editor…</p>;
  }

  return (
    <>

      <div className="edit-profile-bg">
        <div className="edit-profile-card">
          {/* Profile Image Upload */}
          <section className="image-upload-section">
            <h2 className="text-2xl font-semibold">Profile Image</h2>
            <div
              className="image-preview-container"
              onClick={handleImageLabelClick}
              role="button"
              tabIndex={0}
              aria-label="Select profile image"
              onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && handleImageLabelClick()}
            >
              <img
                src={preview || profileImgUrl || '/profile.jpg'}
                alt="Profile Preview"
                className="image-preview"
              />
              <div className="image-preview-overlay">
                <span>✏️</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              aria-hidden="true"
            />
            {imageFile && (
              <div className="selected-filename">
                Selected: <strong>{imageFile.name}</strong>
              </div>
            )}
            <div className="upload-actions-container">
              <button
                onClick={submitImage}
                disabled={!imageFile || imgUploading}
                className="btn-upload-image"
              >
                {imgUploading ? 'Uploading…' : 'Upload Image'}
              </button>
              {imageFile && (
                <button
                  type="button"
                  onClick={cancelImage}
                  className="btn-cancel-image"
                  disabled={imgUploading}
                >
                  Cancel
                </button>
              )}
            </div>
          </section>

          {/* Profile Edit */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={submitProfile} className="profile-form">
              <input
                name="full_name"
                value={profileForm.full_name}
                onChange={handleProfileChange}
                placeholder="Full Name"
                className="form-control"
              />
              <input
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="Phone"
                className="form-control"
              />
              <input
                name="location"
                value={profileForm.location}
                onChange={handleProfileChange}
                placeholder="Location"
                className="form-control"
              />
              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Bio"
                rows={3}
                className="form-control"
              />
              <textarea
                name="about"
                value={profileForm.about}
                onChange={handleProfileChange}
                placeholder="About"
                rows={5}
                className="form-control"
              />
              <button type="submit" className="btn-save">Save Profile</button>
            </form>
          </section>

          {/* Skills, Experiences, Projects Sections */}

          <section>
            <div className="section-header"><h2 className="text-2xl font-semibold">Work Experience</h2><button onClick={() => openModal('experience')} className="add-btn">Add Experience</button></div>
            <ul className="item-list">{experiences.map(exp => (<li key={exp.id} className="item-entry"><div className="item-content"><span className="item-title">{exp.job_title} @ {exp.company_name}</span><span className="item-subtitle">{exp.start_date?.substring(0, 10)} – {exp.is_current ? 'Present' : (exp.end_date?.substring(0, 10))}</span></div><div className="item-actions"><button onClick={() => openModal('experience', exp)} title="Edit Experience" className="icon-btn">✏️</button><button onClick={() => handleExperienceDelete(exp.id)} title="Delete Experience" className="icon-btn delete">🗑️</button></div></li>))}</ul>
          </section>

          <section>
            <div className="section-header"><h2 className="text-2xl font-semibold">Educations</h2><button onClick={() => openModal('education')} className="add-btn">Add Education</button></div>
            <ul className="item-list">{educations.map(s => (<li key={s.id} className="item-entry">
              <div className="item-content">
                <span className="item-title">{s.degree} at {s.school_name}</span>
                <span className="item-subtitle">{s.start_date?.substring(0, 10)} – {s.is_current ? 'Present' : (s.end_date?.substring(0, 10))}</span>
              </div>
              <div className="item-actions"><button onClick={() => openModal('education', s)} title="Edit Education" className="icon-btn">✏️</button>
                <button onClick={() => handleEducationDelete(s.id)} title="Delete Education" className="icon-btn delete">🗑️</button></div></li>))}</ul>
          </section>
          <section>
            <div className="section-header"><h2 className="text-2xl font-semibold">Projects</h2><button onClick={() => openModal('project')} className="add-btn">Add Project</button></div>
            <ul className="item-list">{projects.map(p => (<li key={p.id} className="item-entry"><div className="item-content"><span className="item-title">{p.project_name}</span><p className="item-description">{p.short_description}</p></div><div className="item-actions"><button onClick={() => openModal('project', p)} title="Edit Project" className="icon-btn">✏️</button><button onClick={() => handleProjectDelete(p.id)} title="Delete Project" className="icon-btn delete">🗑️</button></div></li>))}</ul>
          </section>
          <section>
            <div className="section-header"><h2 className="text-2xl font-semibold">Skills</h2><button onClick={() => openModal('skill')} className="add-btn">Add Skill</button></div>
            <ul className="item-list">{skills.map(s => (<li key={s.id} className="item-entry"><div className="item-content"><span className="item-title">{s.skill_name}</span><span className="item-subtitle">{s.level} - {s.category}</span></div><div className="item-actions"><button onClick={() => openModal('skill', s)} title="Edit Skill" className="icon-btn">✏️</button><button onClick={() => handleSkillDelete(s.id)} title="Delete Skill" className="icon-btn delete">🗑️</button></div></li>))}</ul>
          </section>


          {/* CERTIFICATIONS */}
          <section>
            <div className="section-header">
              <h2 className="text-2xl font-semibold">Licenses & Certifications</h2>
              <button onClick={() => openModal('certification')} className="add-btn">Add Certification</button>
            </div>
            <ul className="item-list">
              {certifications.map(cert => (
                <li key={cert.id} className="item-entry">
                  <div className="item-content">
                    <span className="item-title">{cert.name} - {cert.organization}</span>
                    <span className="item-subtitle">{cert.issued_date?.substring(0, 10)}{cert.expiration_date ? ` - ${cert.expiration_date.substring(0, 10)}` : ''}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => openModal('certification', cert)} className="icon-btn" title="Edit">✏️</button>
                    <button onClick={() => handleCertificationDelete(cert.id)} className="icon-btn delete" title="Delete">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* VOLUNTEERING */}
          <section>
            <div className="section-header">
              <h2 className="text-2xl font-semibold">Volunteering</h2>
              <button onClick={() => openModal('volunteering')} className="add-btn">Add Volunteering</button>
            </div>
            <ul className="item-list">
              {volunteerings.map(vol => (
                <li key={vol.id} className="item-entry">
                  <div className="item-content">
                    <span className="item-title">{vol.role} at {vol.organization}</span>
                    <span className="item-subtitle">{vol.start_date?.substring(0, 10)} – {vol.end_date ? vol.end_date.substring(0, 10) : 'Present'}</span>
                    <span className="item-subtitle">{vol.description}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => openModal('volunteering', vol)} className="icon-btn" title="Edit">✏️</button>
                    <button onClick={() => handleVolunteeringDelete(vol.id)} className="icon-btn delete" title="Delete">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={modalState.skill.isOpen} onClose={() => closeModal('skill')}><form onSubmit={handleSkillSubmit} className="modal-form"><h3 className="modal-title">{modalState.skill.data?.id ? 'Edit Skill' : 'Add New Skill'}</h3><label htmlFor="skill_name">Skill Name</label><input id="skill_name" name="skill_name" value={modalState.skill.data?.skill_name || ''} onChange={e => handleModalFormChange(e, 'skill')} placeholder="e.g., React" required /><label htmlFor="level">Level</label><select id="level" name="level" value={modalState.skill.data?.level || 'Beginner'} onChange={e => handleModalFormChange(e, 'skill')}><option>Beginner</option><option>Intermediate</option><option>Expert</option></select><label htmlFor="category">Category</label><input id="category" name="category" value={modalState.skill.data?.category || ''} onChange={e => handleModalFormChange(e, 'skill')} placeholder="e.g., Frontend Development" /><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => closeModal('skill')}>Cancel</button><button type="submit" className="btn-submit">{modalState.skill.data?.id ? 'Save Changes' : 'Add Skill'}</button></div></form></Modal>
      <Modal isOpen={modalState.experience.isOpen} onClose={() => closeModal('experience')}><form onSubmit={handleExperienceSubmit} className="modal-form"><h3 className="modal-title">{modalState.experience.data?.id ? 'Edit Experience' : 'Add Experience'}</h3><label htmlFor="exp-job_title">Job Title</label><input id="exp-job_title" name="job_title" value={modalState.experience.data?.job_title || ''} onChange={e => handleModalFormChange(e, 'experience')} required /><label htmlFor="exp-company_name">Company Name</label><input id="exp-company_name" name="company_name" value={modalState.experience.data?.company_name || ''} onChange={e => handleModalFormChange(e, 'experience')} required /><div style={{ display: 'flex', gap: '1rem', width: '100%' }}><div style={{ flex: 1 }}><label htmlFor="exp-start_date">Start Date</label><input id="exp-start_date" name="start_date" type="date" value={modalState.experience.data?.start_date?.substring(0, 10) || ''} onChange={e => handleModalFormChange(e, 'experience')} required /></div><div style={{ flex: 1 }}><label htmlFor="exp-end_date">End Date</label><input id="exp-end_date" name="end_date" type="date" value={modalState.experience.data?.end_date?.substring(0, 10) || ''} onChange={e => handleModalFormChange(e, 'experience')} disabled={modalState.experience.data?.is_current} /></div></div><label className="flex items-center gap-2 cursor-pointer w-full"><input name="is_current" type="checkbox" checked={modalState.experience.data?.is_current || false} onChange={e => handleModalFormChange(e, 'experience')} />Currently work here</label><label htmlFor="exp-description">Description</label><textarea id="exp-description" name="description" rows="3" value={modalState.experience.data?.description || ''} onChange={e => handleModalFormChange(e, 'experience')}></textarea><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => closeModal('experience')}>Cancel</button><button type="submit" className="btn-submit">{modalState.experience.data?.id ? 'Save Changes' : 'Add Experience'}</button></div></form></Modal>
      <Modal isOpen={modalState.project.isOpen} onClose={() => closeModal('project')}><form onSubmit={handleProjectSubmit} className="modal-form"><h3 className="modal-title">{modalState.project.data?.id ? 'Edit Project' : 'Add Project'}</h3><label htmlFor="proj-project_name">Project Name</label><input id="proj-project_name" name="project_name" value={modalState.project.data?.project_name || ''} onChange={e => handleModalFormChange(e, 'project')} required /><label htmlFor="proj-short_description">Short Description</label><textarea id="proj-short_description" name="short_description" rows="2" value={modalState.project.data?.short_description || ''} onChange={e => handleModalFormChange(e, 'project')}></textarea><label htmlFor="proj-tech_stack">Tech Stack (comma-separated)</label><input id="proj-tech_stack" name="tech_stack" value={modalState.project.data?.tech_stack || ''} onChange={e => handleModalFormChange(e, 'project')} /><label htmlFor="proj-github_url">GitHub URL</label><input id="proj-github_url" name="github_url" type="url" value={modalState.project.data?.github_url || ''} onChange={e => handleModalFormChange(e, 'project')} placeholder="https://github.com/..." /><label htmlFor="proj-live_url">Live URL</label><input id="proj-live_url" name="live_url" type="url" value={modalState.project.data?.live_url || ''} onChange={e => handleModalFormChange(e, 'project')} placeholder="https://..." /><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => closeModal('project')}>Cancel</button><button type="submit" className="btn-submit">{modalState.project.data?.id ? 'Save Changes' : 'Add Project'}</button></div></form></Modal>

      {/* Education Modal */}

      <Modal isOpen={modalState.education.isOpen} onClose={() => closeModal('education')}>
        <form onSubmit={handleEducationSubmit} className="modal-form">
          <h3 className="modal-title">
            {modalState.education.data?.id ? 'Edit Education' : 'Add Education'}
          </h3>

          <label>Institution</label>
          <input
            name="institution"
            value={modalState.education.data?.institution ?? modalState.education.data?.school_name ?? ''}
            onChange={e => handleModalFormChange(e, 'education')}
            required
          />

          <label>Degree</label>
          <input
            name="degree"
            value={modalState.education.data?.degree ?? ''}
            onChange={e => handleModalFormChange(e, 'education')}
            required
          />

          <label>Field of Study</label>
          <input
            name="field_of_study"
            value={modalState.education.data?.field_of_study ?? ''}
            onChange={e => handleModalFormChange(e, 'education')}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Issue Date</label>
              <input
                name="issue_date"
                type="date"
                value={modalState.certification.data?.issue_date || ''}
                onChange={e => handleModalFormChange(e, 'certification')}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Expiration Date</label>
              <input
                name="expiration_date"
                type="date"
                value={modalState.certification.data?.expiration_date || ''}
                onChange={e => handleModalFormChange(e, 'certification')}
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_current"
              checked={!!modalState.education.data?.is_current}
              onChange={e => handleModalFormChange(e, 'education')}
            />
            Currently studying
          </label>

          <label>Description</label>
          <textarea
            name="description"
            rows={3}
            value={modalState.education.data?.description ?? ''}
            onChange={e => handleModalFormChange(e, 'education')}
          />

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => closeModal('education')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {modalState.education.data?.id ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Certification Modal */}
      <Modal isOpen={modalState.certification.isOpen} onClose={() => closeModal('certification')}>
        <form onSubmit={handleCertificationSubmit} className="modal-form">
          <h3 className="modal-title">{modalState.certification.data?.id ? 'Edit Certification' : 'Add Certification'}</h3>
          <label>Name</label>
          <input name="name" value={modalState.certification.data?.name || ''}
            onChange={e => handleModalFormChange(e, 'certification')} required />
          <label>Organization</label>
          <input name="organization" value={modalState.certification.data?.organization || ''}
            onChange={e => handleModalFormChange(e, 'certification')} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Issue Date</label>
              <input name="issue_date" type="date" value={modalState.certification.data?.issue_date || ''}
                onChange={e => handleModalFormChange(e, 'certification')} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>Expiration Date</label>
              <input name="expiration_date" type="date"
                value={modalState.certification.data?.expiration_date || ''}
                onChange={e => handleModalFormChange(e, 'certification')} />
            </div>
          </div>
          <label>Credential ID</label>
          <input name="credential_id" value={modalState.certification.data?.credential_id || ''} onChange={e => handleModalFormChange(e, 'certification')} />
          <label>Credential URL</label>
          <input name="credential_url" type="url" value={modalState.certification.data?.credential_url || ''} onChange={e => handleModalFormChange(e, 'certification')} />
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => closeModal('certification')}>Cancel</button>
            <button type="submit" className="btn-submit">{modalState.certification.data?.id ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      {/* Volunteering Modal */}
      <Modal isOpen={modalState.volunteering.isOpen} onClose={() => closeModal('volunteering')}>
        <form onSubmit={handleVolunteeringSubmit} className="modal-form">
          <h3 className="modal-title">{modalState.volunteering.data?.id ? 'Edit Volunteering' : 'Add Volunteering'}</h3>
          <label>Role</label>
          <input name="role" value={modalState.volunteering.data?.role || ''} onChange={e => handleModalFormChange(e, 'volunteering')} required />
          <label>Organization</label>
          <input name="organization" value={modalState.volunteering.data?.organization || ''} onChange={e => handleModalFormChange(e, 'volunteering')} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Start Date</label>
              <input name="start_date" type="date" value={modalState.volunteering.data?.start_date?.substring(0, 10) || ''} onChange={e => handleModalFormChange(e, 'volunteering')} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>End Date</label>
              <input name="end_date" type="date" value={modalState.volunteering.data?.end_date?.substring(0, 10) || ''} onChange={e => handleModalFormChange(e, 'volunteering')} />
            </div>
          </div>
          <label>Description</label>
          <textarea name="description" rows={3} value={modalState.volunteering.data?.description || ''} onChange={e => handleModalFormChange(e, 'volunteering')} />
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => closeModal('volunteering')}>Cancel</button>
            <button type="submit" className="btn-submit">{modalState.volunteering.data?.id ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}