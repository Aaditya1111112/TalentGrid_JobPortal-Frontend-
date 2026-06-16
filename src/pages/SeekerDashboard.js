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
  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleSave(e) {
    e.preventDefault();
    try { await api.put('/seekers/me', form); flash('Saved.'); }
    catch { flash('Failed to save.'); }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      await api.post('/seekers/me/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      flash('Resume uploaded.');
    } catch { flash('Upload failed.'); }
  }

  async function handleWithdraw(id) {
    if (!window.confirm('Withdraw this application?')) return;
    try { await api.delete(`/applications/${id}`); setApplications(applications.filter(a => a.id !== id)); }
    catch { flash('Failed to withdraw.'); }
  }

  const statusMeta = {
    APPLIED:     { label: 'Applied',     color: 'var(--blue)',  bg: 'var(--blue-bg)' },
    REVIEWED:    { label: 'Reviewed',    color: 'var(--amber)', bg: 'var(--amber-bg)' },
    SHORTLISTED: { label: 'Shortlisted', color: 'var(--green)', bg: 'var(--green-bg)' },
    REJECTED:    { label: 'Rejected',    color: 'var(--red)',   bg: 'var(--red-bg)' },
    HIRED:       { label: 'Hired 🎉',    color: 'var(--green)', bg: 'var(--green-bg)' },
  };

  const navItems = [
    { key: 'profile', label: 'Profile' },
    { key: 'applications', label: `Applications`, count: applications.length },
  ];

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.avatar}>{profile?.firstName?.[0] || '?'}</div>
          <div>
            <div style={s.userName}>{profile?.firstName} {profile?.lastName}</div>
            <div style={s.userEmail}>{profile?.email}</div>
          </div>
        </div>
        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.key} style={tab === item.key ? s.navItemActive : s.navItem} onClick={() => setTab(item.key)}>
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
              <h1 style={s.pageTitle}>Profile</h1>
              <p style={s.pageSub}>Keep your profile up to date for better matches.</p>
            </div>
            <form onSubmit={handleSave} style={s.formGrid}>
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Personal</div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>First name</label>
                    <input style={s.input} name="firstName" value={form.firstName || ''} onChange={handleChange} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Last name</label>
                    <input style={s.input} name="lastName" value={form.lastName || ''} onChange={handleChange} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Education</label>
                  <input style={s.input} name="education" placeholder="B.Tech Computer Science" value={form.education || ''} onChange={handleChange} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Location</label>
                  <input style={s.input} name="locationState" placeholder="Delhi" value={form.locationState || ''} onChange={handleChange} />
                </div>
              </div>

              <div style={s.formSection}>
                <div style={s.sectionLabel}>Career</div>
                <div style={s.field}>
                  <label style={s.label}>Skills <span style={s.hint}>(comma separated)</span></label>
                  <input style={s.input} name="skills" placeholder="Java, React, PostgreSQL" value={form.skills?.join(', ') || ''} onChange={handleSkillsChange} />
                </div>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Experience (yrs)</label>
                    <input style={s.input} name="experienceYears" type="number" value={form.experienceYears || ''} onChange={handleChange} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Notice period (days)</label>
                    <input style={s.input} name="noticePeriodDays" type="number" value={form.noticePeriodDays || ''} onChange={handleChange} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Current CTC (₹)</label>
                  <input style={s.input} name="currentCtc" type="number" placeholder="800000" value={form.currentCtc || ''} onChange={handleChange} />
                </div>
              </div>

              <div style={s.formSection}>
                <div style={s.sectionLabel}>Resume</div>
                <div style={s.resumeBox}>
                  <div style={s.resumeStatus}>
                    {profile?.resumeUrl
                      ? <><span style={s.resumeDot} />Resume uploaded</>
                      : <><span style={{ ...s.resumeDot, background: 'var(--red)' }} />No resume</>
                    }
                  </div>
                  <label style={s.uploadBtn}>
                    {profile?.resumeUrl ? 'Replace PDF' : 'Upload PDF'}
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <button style={s.saveBtn} type="submit">Save changes</button>
            </form>
          </>
        )}

        {tab === 'applications' && (
          <>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Applications</h1>
              <p style={s.pageSub}>{applications.length} total · track your progress here.</p>
            </div>
            {applications.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyTitle}>No applications yet</p>
                <p style={s.emptySub}>Browse jobs and apply to get started.</p>
              </div>
            ) : (
              <div style={s.appList}>
                {applications.map(app => {
                  const meta = statusMeta[app.status] || { label: app.status, color: 'var(--text-secondary)', bg: 'var(--highlight)' };
                  return (
                    <div key={app.id} style={s.appRow}>
                      <div style={s.appLeft}>
                        <div style={s.appTitle}>{app.jobTitle}</div>
                        <div style={s.appCompany}>{app.companyName}</div>
                        <div style={s.appDate}>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div style={s.appRight}>
                        <span style={{ ...s.statusBadge, color: meta.color, background: meta.bg }}>{meta.label}</span>
                        {app.status === 'APPLIED' && (
                          <button style={s.withdrawBtn} onClick={() => handleWithdraw(app.id)}>Withdraw</button>
                        )}
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
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', flexShrink: 0 },
  userName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  userEmail: { fontSize: '12px', color: 'var(--text-tertiary)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--highlight)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', cursor: 'pointer', textAlign: 'left' },
  navCount: { fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)' },
  main: { flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' },
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
  input: { padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' },
  resumeBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--highlight)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' },
  resumeStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-primary)' },
  resumeDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' },
  uploadBtn: { fontSize: '13px', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', background: 'var(--surface)' },
  saveBtn: { alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  appList: { display: 'flex', flexDirection: 'column' },
  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' },
  appLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  appTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
  appCompany: { fontSize: '13px', color: 'var(--text-secondary)' },
  appDate: { fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)' },
  appRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  statusBadge: { fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '100px' },
  withdrawBtn: { fontSize: '12px', color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid #f5c6c6', borderRadius: 'var(--radius-sm)', padding: '5px 10px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyTitle: { fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' },
  emptySub: { fontSize: '14px', color: 'var(--text-tertiary)' },
};

export default SeekerDashboard;