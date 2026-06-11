import { useState, useEffect } from 'react';
import api from '../api/axios';

function EmployerDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({});
  const [jobForm, setJobForm] = useState({ title: '', description: '', requiredSkills: '', salaryMin: '', salaryMax: '', experienceRequiredYears: '', locationState: '', status: 'OPEN' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/employers/me').then(r => { setProfile(r.data.data); setForm(r.data.data); });
    api.get('/jobs/employer/me').then(r => setJobs(r.data.data));
  }, []);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleSaveProfile(e) {
    e.preventDefault();
    try { await api.put('/employers/me', form); flash('Profile updated'); }
    catch { flash('Update failed'); }
  }

  async function handlePostJob(e) {
    e.preventDefault();
    try {
      const payload = {
        ...jobForm,
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()),
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
        experienceRequiredYears: Number(jobForm.experienceRequiredYears)
      };
      const res = await api.post('/jobs', payload);
      setJobs([res.data.data, ...jobs]);
      setJobForm({ title: '', description: '', requiredSkills: '', salaryMin: '', salaryMax: '', experienceRequiredYears: '', locationState: '', status: 'OPEN' });
      flash('Job posted successfully');
      setTab('jobs');
    } catch { flash('Failed to post job'); }
  }

  async function handleDeleteJob(id) {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/jobs/${id}`); setJobs(jobs.filter(j => j.id !== id)); flash('Job deleted'); }
    catch { flash('Delete failed'); }
  }

  async function handleViewApplicants(jobId) {
    const res = await api.get(`/applications/job/${jobId}`);
    setApplications(res.data.data);
    setTab('applicants');
  }

  async function handleStatusChange(appId, status) {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
    } catch { flash('Update failed'); }
  }

  async function handleDownloadResume(seekerId) {
    try {
      const res = await api.get(`/seekers/${seekerId}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${seekerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { flash('Resume not available'); }
  }

  const statusColor = { APPLIED: '#3b82f6', REVIEWED: '#f59e0b', SHORTLISTED: '#10b981', REJECTED: '#ef4444', HIRED: '#8b5cf6' };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.avatar}>{profile?.companyName?.[0] || '?'}</div>
        <p style={s.name}>{profile?.companyName}</p>
        <p style={s.email}>{profile?.industry}</p>
        {['profile', 'jobs', 'post'].map(t => (
          <button key={t} style={tab === t ? s.navActive : s.nav} onClick={() => setTab(t)}>
            {t === 'profile' ? 'Company Profile' : t === 'jobs' ? `My Jobs (${jobs.length})` : 'Post a Job'}
          </button>
        ))}
      </div>

      <div style={s.main}>
        {msg && <div style={s.msg}>{msg}</div>}

        {tab === 'profile' && (
          <div style={s.card}>
            <h2 style={s.heading}>Company Profile</h2>
            <form onSubmit={handleSaveProfile} style={s.form}>
              <input style={s.input} name="companyName" placeholder="Company Name" value={form.companyName || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
              <input style={s.input} name="industry" placeholder="Industry" value={form.industry || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
              <input style={s.input} name="companyWebsite" placeholder="Website" value={form.companyWebsite || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
              <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }} name="companyDescription" placeholder="Company Description" value={form.companyDescription || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
              <button style={s.btn} type="submit">Save Profile</button>
            </form>
          </div>
        )}

        {tab === 'post' && (
          <div style={s.card}>
            <h2 style={s.heading}>Post a New Job</h2>
            <form onSubmit={handlePostJob} style={s.form}>
              <input style={s.input} placeholder="Job Title" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
              <textarea style={{ ...s.input, height: '120px', resize: 'vertical' }} placeholder="Job Description" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
              <input style={s.input} placeholder="Required Skills (comma separated)" value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} />
              <div style={s.row}>
                <input style={s.input} type="number" placeholder="Min Salary" value={jobForm.salaryMin} onChange={e => setJobForm({ ...jobForm, salaryMin: e.target.value })} />
                <input style={s.input} type="number" placeholder="Max Salary" value={jobForm.salaryMax} onChange={e => setJobForm({ ...jobForm, salaryMax: e.target.value })} />
              </div>
              <div style={s.row}>
                <input style={s.input} type="number" placeholder="Experience Required (yrs)" value={jobForm.experienceRequiredYears} onChange={e => setJobForm({ ...jobForm, experienceRequiredYears: e.target.value })} required />
                <input style={s.input} placeholder="Location State" value={jobForm.locationState} onChange={e => setJobForm({ ...jobForm, locationState: e.target.value })} />
              </div>
              <select style={s.input} value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value })}>
                <option value="OPEN">OPEN</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <button style={s.btn} type="submit">Post Job</button>
            </form>
          </div>
        )}

        {tab === 'jobs' && (
          <div style={s.card}>
            <h2 style={s.heading}>My Job Listings</h2>
            {jobs.length === 0 && <p style={s.empty}>No jobs posted yet.</p>}
            {jobs.map(job => (
              <div key={job.id} style={s.jobRow}>
                <div>
                  <p style={s.jobTitle}>{job.title}</p>
                  <p style={s.meta}>
                    📍 {job.locationState} · 🧑‍💼 {job.experienceRequiredYears}+ yrs ·{' '}
                    <span style={{ color: statusColor[job.status] || '#94a3b8' }}>{job.status}</span>
                  </p>
                </div>
                <div style={s.jobActions}>
                  <button style={s.viewBtn} onClick={() => handleViewApplicants(job.id)}>View Applicants</button>
                  <button style={s.deleteBtn} onClick={() => handleDeleteJob(job.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'applicants' && (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button style={s.backBtn} onClick={() => setTab('jobs')}>← Back</button>
              <h2 style={{ ...s.heading, margin: 0 }}>Applicants</h2>
            </div>
            {applications.length === 0 && <p style={s.empty}>No applicants yet.</p>}
            {applications.map(app => (
              <div key={app.id} style={s.appRow}>
                <div>
                  <p style={s.jobTitle}>{app.seekerFirstName} {app.seekerLastName}</p>
                  <p style={s.meta}>{app.seekerEmail} · {app.seekerExperienceYears} yrs exp</p>
                  {app.seekerSkills && <p style={s.meta}>{app.seekerSkills.join(', ')}</p>}
                </div>
                <div style={s.jobActions}>
                  <span style={{ ...s.badge, background: statusColor[app.status] || '#94a3b8' }}>{app.status}</span>
                  <button style={s.resumeBtn} onClick={() => handleDownloadResume(app.seekerId)}>
                    Download Resume
                  </button>
                  <select style={s.select} value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)}>
                    <option value="APPLIED">APPLIED</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="HIRED">HIRED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#0f0f13' },
  sidebar: { width: '240px', background: '#13131f', borderRight: '1px solid #2d2d44', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' },
  name: { fontWeight: '600', fontSize: '16px', margin: 0, textAlign: 'center', color: '#e2e8f0' },
  email: { fontSize: '12px', color: '#7c85a2', margin: 0, textAlign: 'center' },
  nav: { width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#94a3b8' },
  navActive: { width: '100%', padding: '10px 14px', background: '#2d1f4e', border: 'none', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#a855f7', fontWeight: '600' },
  main: { flex: 1, padding: '32px' },
  card: { background: '#1e1e2e', borderRadius: '12px', padding: '28px', border: '1px solid #2d2d44' },
  heading: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', gap: '14px' },
  input: { flex: 1, padding: '11px 14px', border: '1px solid #2d2d44', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', background: '#13131f', color: '#e2e8f0' },
  btn: { padding: '12px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' },
  msg: { background: '#052e16', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #2d2d44' },
  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #2d2d44' },
  jobTitle: { fontWeight: '600', fontSize: '15px', margin: 0, color: '#e2e8f0' },
  meta: { fontSize: '13px', color: '#7c85a2', margin: '4px 0 0' },
  jobActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  viewBtn: { padding: '7px 14px', background: '#2d1f4e', color: '#a855f7', border: '1px solid #4c1d95', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  deleteBtn: { padding: '7px 14px', background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  backBtn: { padding: '7px 14px', background: '#16213e', color: '#94a3b8', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  resumeBtn: { padding: '7px 14px', background: '#16213e', color: '#38bdf8', border: '1px solid #0369a1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  select: { padding: '7px 10px', border: '1px solid #2d2d44', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: '#13131f', color: '#e2e8f0' },
  empty: { color: '#7c85a2', textAlign: 'center', marginTop: '40px' },
};

export default EmployerDashboard;