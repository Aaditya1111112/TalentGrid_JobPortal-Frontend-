import { useState, useEffect } from 'react';
import api from '../api/axios';

function SeekerDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/seekers/me').then(r => { setProfile(r.data.data); setForm(r.data.data); });
    api.get('/applications/seeker/me').then(r => setApplications(r.data.data));
  }, []);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function handleSkillsChange(e) { setForm({ ...form, skills: e.target.value.split(',').map(s => s.trim()) }); }

  async function handleSave(e) {
    e.preventDefault();
    try { await api.put('/seekers/me', form); setMsg('Profile updated successfully'); setTimeout(() => setMsg(''), 3000); }
    catch { setMsg('Update failed'); }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/seekers/me/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Resume uploaded');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Upload failed'); }
  }

  async function handleWithdraw(id) {
    if (!window.confirm('Withdraw this application?')) return;
    try { await api.delete(`/applications/${id}`); setApplications(applications.filter(a => a.id !== id)); }
    catch { setMsg('Withdraw failed'); }
  }

  const statusColor = { APPLIED: '#3b82f6', REVIEWED: '#f59e0b', SHORTLISTED: '#10b981', REJECTED: '#ef4444', HIRED: '#8b5cf6' };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.avatar}>{profile?.firstName?.[0] || '?'}</div>
        <p style={s.name}>{profile?.firstName} {profile?.lastName}</p>
        <p style={s.email}>{profile?.email}</p>
        <button style={tab === 'profile' ? s.navActive : s.nav} onClick={() => setTab('profile')}>My Profile</button>
        <button style={tab === 'applications' ? s.navActive : s.nav} onClick={() => setTab('applications')}>Applications ({applications.length})</button>
      </div>
      <div style={s.main}>
        {msg && <div style={s.msg}>{msg}</div>}
        {tab === 'profile' && (
          <div style={s.card}>
            <h2 style={s.heading}>Edit Profile</h2>
            <form onSubmit={handleSave} style={s.form}>
              <div style={s.row}>
                <input style={s.input} name="firstName" placeholder="First Name" value={form.firstName || ''} onChange={handleChange} />
                <input style={s.input} name="lastName" placeholder="Last Name" value={form.lastName || ''} onChange={handleChange} />
              </div>
              <input style={s.input} name="skills" placeholder="Skills (comma separated)" value={form.skills?.join(', ') || ''} onChange={handleSkillsChange} />
              <input style={s.input} name="education" placeholder="Education" value={form.education || ''} onChange={handleChange} />
              <div style={s.row}>
                <input style={s.input} name="experienceYears" type="number" placeholder="Experience (years)" value={form.experienceYears || ''} onChange={handleChange} />
                <input style={s.input} name="noticePeriodDays" type="number" placeholder="Notice Period (days)" value={form.noticePeriodDays || ''} onChange={handleChange} />
              </div>
              <div style={s.row}>
                <input style={s.input} name="currentCtc" type="number" placeholder="Current CTC" value={form.currentCtc || ''} onChange={handleChange} />
                <input style={s.input} name="locationState" placeholder="Location State" value={form.locationState || ''} onChange={handleChange} />
              </div>
              <button style={s.btn} type="submit">Save Profile</button>
            </form>
            <div style={{ marginTop: '24px', borderTop: '1px solid #2d2d44', paddingTop: '20px' }}>
              <p style={s.label}>Resume {profile?.resumeUrl ? '✅ Uploaded' : '❌ Not uploaded'}</p>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ color: '#94a3b8' }} />
            </div>
          </div>
        )}
        {tab === 'applications' && (
          <div style={s.card}>
            <h2 style={s.heading}>My Applications</h2>
            {applications.length === 0 && <p style={s.empty}>No applications yet.</p>}
            {applications.map(app => (
              <div key={app.id} style={s.appRow}>
                <div>
                  <p style={s.jobTitle}>{app.jobTitle}</p>
                  <p style={s.company}>{app.companyName}</p>
                </div>
                <div style={s.appRight}>
                  <span style={{ ...s.badge, background: statusColor[app.status] || '#94a3b8' }}>{app.status}</span>
                  {app.status === 'APPLIED' && (
                    <button style={s.withdrawBtn} onClick={() => handleWithdraw(app.id)}>Withdraw</button>
                  )}
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
  label: { fontSize: '14px', color: '#94a3b8', marginBottom: '8px' },
  msg: { background: '#052e16', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #2d2d44' },
  appRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  jobTitle: { fontWeight: '600', fontSize: '15px', margin: 0, color: '#e2e8f0' },
  company: { fontSize: '13px', color: '#7c85a2', margin: '4px 0 0' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: '600' },
  withdrawBtn: { padding: '6px 14px', background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  empty: { color: '#7c85a2', textAlign: 'center', marginTop: '40px' },
};

export default SeekerDashboard;