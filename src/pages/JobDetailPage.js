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
      setApplied(true);
      setMsg('Successfully applied!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally { setLoading(false); }
  }

  if (error) return (
    <div style={s.center}>
      <p style={{ color: '#f87171' }}>{error}</p>
      <button style={s.backBtn} onClick={() => navigate('/')}>← Back to Jobs</button>
    </div>
  );

  if (!job) return <div style={s.center}>Loading...</div>;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Back to Jobs</button>
        <div style={s.card}>
          <div style={s.header}>
            <div>
              <h1 style={s.title}>{job.title}</h1>
              <p style={s.company}>{job.companyName}</p>
              <p style={s.industry}>{job.industry}</p>
            </div>
            <div style={s.headerRight}>
              <span style={s.statusBadge}>{job.status}</span>
              {auth?.role === 'SEEKER' && (
                <button style={applied ? s.appliedBtn : s.applyBtn} onClick={handleApply} disabled={applied || loading}>
                  {applied ? '✓ Applied' : loading ? 'Applying...' : 'Apply Now'}
                </button>
              )}
              {!auth && <button style={s.applyBtn} onClick={() => navigate('/auth')}>Login to Apply</button>}
            </div>
          </div>
          {msg && <div style={s.success}>{msg}</div>}
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.metaRow}>
            <div style={s.metaItem}><span style={s.metaLabel}>📍 Location</span><span style={s.metaValue}>{job.locationState || 'Not specified'}</span></div>
            <div style={s.metaItem}><span style={s.metaLabel}>🧑‍💼 Experience</span><span style={s.metaValue}>{job.experienceRequiredYears}+ years</span></div>
            {job.salaryMin && <div style={s.metaItem}><span style={s.metaLabel}>💰 Salary</span><span style={s.metaValue}>₹{(job.salaryMin / 100000).toFixed(1)}L – ₹{(job.salaryMax / 100000).toFixed(1)}L</span></div>}
            <div style={s.metaItem}><span style={s.metaLabel}>📅 Posted</span><span style={s.metaValue}>{new Date(job.createdAt).toLocaleDateString()}</span></div>
          </div>
          {job.requiredSkills?.length > 0 && (
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Required Skills</h3>
              <div style={s.skills}>{job.requiredSkills.map((skill, i) => <span key={i} style={s.skill}>{skill}</span>)}</div>
            </div>
          )}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Job Description</h3>
            <p style={s.description}>{job.description}</p>
          </div>
          {auth?.role === 'SEEKER' && (
            <div style={s.applyBottom}>
              <button style={applied ? s.appliedBtn : s.applyBtn} onClick={handleApply} disabled={applied || loading}>
                {applied ? '✓ Applied' : loading ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#0f0f13', minHeight: 'calc(100vh - 60px)', padding: '32px 20px' },
  container: { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', gap: '16px', background: '#0f0f13', color: '#e2e8f0' },
  backBtn: { alignSelf: 'flex-start', padding: '8px 16px', background: '#1e1e2e', border: '1px solid #2d2d44', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#94a3b8' },
  card: { background: '#1e1e2e', borderRadius: '12px', padding: '32px', border: '1px solid #2d2d44', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#e2e8f0', margin: 0 },
  company: { fontSize: '16px', color: '#a855f7', fontWeight: '600', margin: '6px 0 2px' },
  industry: { fontSize: '13px', color: '#7c85a2', margin: 0 },
  statusBadge: { padding: '4px 12px', background: '#052e16', color: '#4ade80', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  applyBtn: { padding: '12px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  appliedBtn: { padding: '12px 28px', background: '#052e16', color: '#4ade80', border: '1px solid #14532d', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'default' },
  metaRow: { display: 'flex', gap: '24px', flexWrap: 'wrap', background: '#16213e', borderRadius: '10px', padding: '20px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  metaLabel: { fontSize: '12px', color: '#7c85a2', fontWeight: '500' },
  metaValue: { fontSize: '15px', color: '#e2e8f0', fontWeight: '600' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#e2e8f0', margin: 0 },
  skills: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  skill: { padding: '6px 14px', background: '#2d1f4e', color: '#a855f7', borderRadius: '6px', fontSize: '13px', fontWeight: '500' },
  description: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' },
  applyBottom: { borderTop: '1px solid #2d2d44', paddingTop: '20px' },
  success: { background: '#052e16', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' },
  errorBox: { background: '#2d0a0a', color: '#f87171', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' },
};

export default JobDetailPage;