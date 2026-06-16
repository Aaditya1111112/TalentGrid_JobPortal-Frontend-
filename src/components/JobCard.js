import { useNavigate } from 'react-router-dom';

function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div style={s.card} onClick={() => navigate(`/jobs/${job.id}`)}>
      <div style={s.top}>
        <div style={s.companyBadge}>{job.companyName?.[0]}</div>
        <div style={s.topRight}>
          {job.industry && <span style={s.industry}>{job.industry}</span>}
        </div>
      </div>
      <div style={s.body}>
        <h3 style={s.title}>{job.title}</h3>
        <p style={s.company}>{job.companyName}</p>
      </div>
      <div style={s.meta}>
        <span style={s.metaItem}>📍 {job.locationState || 'Remote'}</span>
        <span style={s.dot}>·</span>
        <span style={s.metaItem}>{job.experienceRequiredYears}+ yrs</span>
        {job.salaryMin && (
          <>
            <span style={s.dot}>·</span>
            <span style={s.metaItem}>₹{(job.salaryMin / 100000).toFixed(0)}–{(job.salaryMax / 100000).toFixed(0)}L</span>
          </>
        )}
      </div>
      {job.requiredSkills?.length > 0 && (
        <div style={s.skills}>
          {job.requiredSkills.slice(0, 3).map((skill, i) => (
            <span key={i} style={s.skill}>{skill}</span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span style={s.skillMore}>+{job.requiredSkills.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyBadge: {
    width: '36px', height: '36px',
    background: 'var(--highlight)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  topRight: { display: 'flex', gap: '6px' },
  industry: {
    fontSize: '11px', fontWeight: '500',
    color: 'var(--text-secondary)',
    background: 'var(--highlight)',
    padding: '3px 8px',
    borderRadius: '100px',
    border: '1px solid var(--border)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  body: { display: 'flex', flexDirection: 'column', gap: '2px' },
  title: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.3 },
  company: { fontSize: '13px', color: 'var(--text-secondary)' },
  meta: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  metaItem: { fontSize: '13px', color: 'var(--text-tertiary)' },
  dot: { color: 'var(--border-strong)', fontSize: '12px' },
  skills: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  skill: {
    fontSize: '12px', color: 'var(--text-secondary)',
    background: 'var(--bg)', padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
  },
  skillMore: {
    fontSize: '12px', color: 'var(--text-tertiary)',
    padding: '3px 8px',
  },
};

export default JobCard;