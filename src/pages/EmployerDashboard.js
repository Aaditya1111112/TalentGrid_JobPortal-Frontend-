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
    try { await api.put('/employers/me', form); flash('Saved.'); }
    catch { flash('Failed to save.'); }
  }

  async function handlePostJob(e) {
    e.preventDefault();
    try {
      const payload = { ...jobForm, requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()), salaryMin: Number(jobForm.salaryMin), salaryMax: Number(jobForm.salaryMax), experienceRequiredYears: Number(jobForm.experienceRequiredYears) };
      const res = await api.post('/jobs', payload);
      setJobs([res.data.data, ...jobs]);
      setJobForm({ title: '', description: '', requiredSkills: '', salaryMin: '', salaryMax: '', experienceRequiredYears: '', locationState: '', status: 'OPEN' });
      flash('Job posted.'); setTab('jobs');
    } catch { flash('Failed to post job.'); }
  }

  async function handleDeleteJob(id) {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/jobs/${id}`); setJobs(jobs.filter(j => j.id !== id)); flash('Job removed.'); }
    catch { flash('Delete failed.'); }
  }

  async function handleViewApplicants(jobId) {
    const res = await api.get(`/applications/job/${jobId}`);
    setApplications(res.data.data); setTab('applicants');
  }

  async function handleStatusChange(appId, status) {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
    } catch { flash('Update failed.'); }
  }

  async function handleDownloadResume(seekerId) {
    try {
      const res = await api.get(`/seekers/${seekerId}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `resume_${seekerId}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { flash('Resume not available.'); }
  }

  const statusMeta = {
    APPLIED:     { color: 'var(--blue)',  bg: 'var(--blue-bg)' },
    REVIEWED:    { color: 'var(--amber)', bg: 'var(--amber-bg)' },
    SHORTLISTED: { color: 'var(--green)', bg: 'var(--green-bg)' },
    REJECTED:    { color: 'var(--red)',   bg: 'var(--red-bg)' },
    HIRED:       { color: 'var(--green)', bg: 'var(--green-bg)' },
  };

  const navItems = [
    { key: 'profile', label: 'Company' },
    { key: 'jobs', label: 'Jobs', count: jobs.length },
    { key: 'post', label: 'Post a job' },
  ];

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.avatar}>{profile?.companyName?.[0] || '?'}</div>
          <div>
            <div style={s.userName}>{profile?.companyName}</div>
            <div style={s.userEmail}>{profile?.industry}</div>
          </div>
        </div>
        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.key} style={tab === item.key || (tab === 'applicants' && item.key === 'jobs') ? s.navItemActive : s.navItem} onClick={() => setTab(item.key)}>
              <span>{item.label}</span>
              {item.count !== undefined && <span style={s.navCount}>{item.count}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div style={s.main}>
        {msg && <div style={s.toast}>{msg}</div>}

        {tab === 'profile' && (
          <>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Company profile</h1>
              <p style={s.pageSub}>This information appears on your job listings.</p>
            </div>
            <form onSubmit={handleSaveProfile} style={s.formGrid}>
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Details</div>
                <div style={s.field}>
                  <label style={s.label}>Company name</label>
                  <input style={s.input} name="companyName" value={form.companyName || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
                </div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Industry</label>
                    <input style={s.input} name="industry" placeholder="Fintech" value={form.industry || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Website</label>
                    <input style={s.input} name="companyWebsite" placeholder="acme.com" value={form.companyWebsite || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }} name="companyDescription" placeholder="What does your company do?" value={form.companyDescription || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} />
                </div>
              </div>
              <button style={s.saveBtn} type="submit">Save changes</button>
            </form>
          </>
        )}

        {tab === 'post' && (
          <>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Post a job</h1>
              <p style={s.pageSub}>Fill in the details below to publish a new listing.</p>
            </div>
            <form onSubmit={handlePostJob} style={s.formGrid}>
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Role</div>
                <div style={s.field}>
                  <label style={s.label}>Job title</label>
                  <input style={s.input} placeholder="e.g. Senior Backend Developer" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea style={{ ...s.input, height: '140px', resize: 'vertical' }} placeholder="Describe the role, responsibilities, and requirements..." value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Required skills <span style={s.hint}>(comma separated)</span></label>
                  <input style={s.input} placeholder="Java, Spring Boot, PostgreSQL" value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} />
                </div>
              </div>
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Compensation & location</div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Min salary (₹)</label>
                    <input style={s.input} type="number" placeholder="800000" value={jobForm.salaryMin} onChange={e => setJobForm({ ...jobForm, salaryMin: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Max salary (₹)</label>
                    <input style={s.input} type="number" placeholder="1500000" value={jobForm.salaryMax} onChange={e => setJobForm({ ...jobForm, salaryMax: e.target.value })} />
                  </div>
                </div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Experience required (yrs)</label>
                    <input style={s.input} type="number" placeholder="2" value={jobForm.experienceRequiredYears} onChange={e => setJobForm({ ...jobForm, experienceRequiredYears: e.target.value })} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Location</label>
                    <input style={s.input} placeholder="Delhi" value={jobForm.locationState} onChange={e => setJobForm({ ...jobForm, locationState: e.target.value })} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select style={s.input} value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value })}>
                    <option value="OPEN">Open</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              <button style={s.saveBtn} type="submit">Publish job →</button>
            </form>
          </>
        )}

        {tab === 'jobs' && (
          <>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Your listings</h1>
              <p style={s.pageSub}>{jobs.length} active job{jobs.length !== 1 ? 's' : ''}.</p>
            </div>
            {jobs.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyTitle}>No jobs posted yet</p>
                <button style={s.saveBtn} onClick={() => setTab('post')}>Post your first job →</button>
              </div>
            ) : (
              <div style={s.jobList}>
                {jobs.map(job => (
                  <div key={job.id} style={s.jobRow}>
                    <div style={s.jobLeft}>
                      <div style={s.jobTitle}>{job.title}</div>
                      <div style={s.jobMeta}>
                        {job.locationState && <span>{job.locationState}</span>}
                        <span>·</span>
                        <span>{job.experienceRequiredYears}+ yrs</span>
                        <span>·</span>
                        <span style={{ color: job.status === 'OPEN' ? 'var(--green)' : 'var(--text-tertiary)', fontWeight: '500' }}>{job.status}</span>
                      </div>
                    </div>
                    <div style={s.jobActions}>
                      <button style={s.ghostBtn} onClick={() => handleViewApplicants(job.id)}>View applicants</button>
                      <button style={s.dangerBtn} onClick={() => handleDeleteJob(job.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'applicants' && (
          <>
            <div style={s.pageHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={s.backBtn} onClick={() => setTab('jobs')}>←</button>
                <h1 style={s.pageTitle}>Applicants</h1>
              </div>
              <p style={s.pageSub}>{applications.length} candidate{applications.length !== 1 ? 's' : ''} applied.</p>
            </div>
            {applications.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyTitle}>No applicants yet</p>
                <p style={s.emptySub}>Share your listing to attract candidates.</p>
              </div>
            ) : (
              <div style={s.jobList}>
                {applications.map(app => {
                  const meta = statusMeta[app.status] || {};
                  return (
                    <div key={app.id} style={s.appRow}>
                      <div style={s.appLeft}>
                        <div style={s.jobTitle}>{app.seekerFirstName} {app.seekerLastName}</div>
                        <div style={s.jobMeta}>
                          <span>{app.seekerEmail}</span>
                          {app.seekerExperienceYears && <><span>·</span><span>{app.seekerExperienceYears} yrs exp</span></>}
                        </div>
                        {app.seekerSkills?.length > 0 && (
                          <div style={s.appSkills}>
                            {app.seekerSkills.slice(0, 4).map((sk, i) => <span key={i} style={s.appSkill}>{sk}</span>)}
                          </div>
                        )}
                      </div>
                      <div style={s.appRight}>
                        <span style={{ ...s.statusBadge, color: meta.color, background: meta.bg }}>{app.status}</span>
                        <button style={s.ghostBtn} onClick={() => handleDownloadResume(app.seekerId)}>Resume ↓</button>
                        <select style={s.select} value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)}>
                          <option value="APPLIED">Applied</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="HIRED">Hired</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' },
  sidebar: { width: '240px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' },
  sideTop: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' },
  avatar: { width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', flexShrink: 0 },
  userName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  userEmail: { fontSize: '12px', color: 'var(--text-tertiary)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--highlight)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', cursor: 'pointer', textAlign: 'left' },
  navCount: { fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)' },
  main: { flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' },
  toast: { padding: '10px 14px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid #b3dfc6' },
  pageHeader: { display: 'flex', flexDirection: 'column', gap: '4px' },
  pageTitle: { fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  pageSub: { fontSize: '14px', color: 'var(--text-secondary)' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '32px' },
  formSection: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionLabel: { fontSize: '11px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--mono)', paddingBottom: '8px', borderBottom: '1px solid var(--border)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' },
  hint: { fontWeight: '400', color: 'var(--text-tertiary)' },
  input: { padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', width: '100%' },
  saveBtn: { alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  jobList: { display: 'flex', flexDirection: 'column' },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' },
  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--border)', gap: '16px' },
  jobLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  appLeft: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  jobTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
  jobMeta: { display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)' },
  appSkills: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' },
  appSkill: { fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--highlight)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 7px', fontFamily: 'var(--mono)' },
  jobActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  appRight: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  ghostBtn: { padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' },
  dangerBtn: { padding: '6px 12px', background: 'var(--red-bg)', border: '1px solid #f5c6c6', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--red)', cursor: 'pointer' },
  backBtn: { padding: '6px 10px', background: 'none', border: 'none', fontSize: '18px', color: 'var(--text-secondary)', cursor: 'pointer' },
  statusBadge: { fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' },
  select: { padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' },
  emptySub: { fontSize: '14px', color: 'var(--text-tertiary)' },
};

export default EmployerDashboard;