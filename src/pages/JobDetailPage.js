import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function JobDetailPage() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data.data)).catch(() => setError('Job not found'));
  }, [id]);

  async function handleApply() {
    if (!auth) { navigate('/auth'); return; }
    setLoading(true);
    try {
      await api.post(`/applications/job/${id}/apply`);
      setApplied(true); setMsg('Application submitted.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to apply'); }
    finally { setLoading(false); }
  }

  if (!job && !error) return <div style={s.loading}>Loading...</div>;

  if (error) return (
    <div style={s.loading}>
      <p style={{ color: 'var(--red)', marginBottom: '16px' }}>{error}</p>
      <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Back to jobs</button>
        <div style={s.sideCard}>
          <div style={s.companyAvatar}>{job.companyName?.[0]}</div>
          <div style={s.companyName}>{job.companyName}</div>
          {job.industry && <div style={s.companyIndustry}>{job.industry}</div>}
          <div style={s.divider} />
          <div style={s.statList}>
            <div style={s.stat}>
              <span style={s.statLabel}>Location</span>
              <span style={s.statVal}>{job.locationState || 'Remote'}</span>
            </div>
            <div style={s.stat}>
              <span style={s.statLabel}>Experience</span>
              <span style={s.statVal}>{job.experienceRequiredYears}+ years</span>
            </div>
            {job.salaryMin && (
              <div style={s.stat}>
                <span style={s.statLabel}>Salary</span>
                <span style={s.statVal}>₹{(job.salaryMin / 100000).toFixed(1)}L – ₹{(job.salaryMax / 100000).toFixed(1)}L</span>
              </div>
            )}
            <div style={s.stat}>
              <span style={s.statLabel}>Posted</span>
              <span style={s.statVal}>{new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div style={s.stat}>
              <span style={s.statLabel}>Status</span>
              <span style={{ ...s.statVal, color: 'var(--green)', fontWeight: '500' }}>{job.status}</span>
            </div>
          </div>
          {msg && <div style={s.success}>{msg}</div>}
          {error && !job && <div style={s.errorBox}>{error}</div>}
          {auth?.role === 'SEEKER' && (
            <button style={applied ? s.appliedBtn : s.applyBtn} onClick={handleApply} disabled={applied || loading}>
              {applied ? '✓ Applied' : loading ? 'Submitting...' : 'Apply for this role'}
            </button>
          )}
          {!auth && (
            <button style={s.applyBtn} onClick={() => navigate('/auth')}>Sign in to apply</button>
          )}
        </div>
      </div>

      <div style={s.main}>
        <div style={s.titleBlock}>
          <span style={s.eyebrow}>{job.industry || 'Open role'}</span>
          <h1 style={s.title}>{job.title}</h1>
        </div>

        {job.requiredSkills?.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Required skills</h2>
            <div style={s.skills}>
              {job.requiredSkills.map((skill, i) => (
                <span key={i} style={s.skill}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div style={s.section}>
          <h2 style={s.sectionTitle}>About this role</h2>
          <p style={s.description}>{job.description}</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)', maxWidth: '1080px', margin: '0 auto', padding: '40px 32px', gap: '48px' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', color: 'var(--text-secondary)' },
  sidebar: { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' },
  backBtn: { background: 'none', border: 'none', padding: 0, fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' },
  sideCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  companyAvatar: { width: '48px', height: '48px', background: 'var(--highlight)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' },
  companyName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' },
  companyIndustry: { fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--mono)' },
  divider: { height: '1px', background: 'var(--border)' },
  statList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statLabel: { fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--mono)' },
  statVal: { fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' },
  applyBtn: { padding: '11px 16px', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', width: '100%' },
  appliedBtn: { padding: '11px 16px', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid #b3dfc6', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', cursor: 'default', width: '100%' },
  success: { padding: '10px 12px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid #b3dfc6' },
  errorBox: { padding: '10px 12px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', fontSize: '13px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' },
  titleBlock: { display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' },
  eyebrow: { fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--mono)' },
  title: { fontSize: '40px', fontWeight: '300', color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.15 },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  skills: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  skill: { padding: '6px 12px', background: 'var(--highlight)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--mono)' },
  description: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
};

export default JobDetailPage;