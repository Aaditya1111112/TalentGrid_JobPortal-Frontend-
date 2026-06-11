import { useNavigate } from 'react-router-dom';

function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.companyName}</p>
        </div>
        <span style={styles.industry}>{job.industry}</span>
      </div>
      <div style={styles.meta}>
        <span style={styles.tag}>📍 {job.locationState || 'Remote'}</span>
        <span style={styles.tag}>🧑‍💼 {job.experienceRequiredYears}+ yrs</span>
        {job.salaryMin && (
          <span style={styles.tag}>
            💰 ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹{(job.salaryMax / 100000).toFixed(1)}L
          </span>
        )}
      </div>
      {job.requiredSkills && (
        <div style={styles.skills}>
          {job.requiredSkills.slice(0, 4).map((s, i) => (
            <span key={i} style={styles.skill}>{s}</span>
          ))}
        </div>
      )}
      <button onClick={() => navigate(`/jobs/${job.id}`)} style={styles.btn}>
        View Details
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: '#1e1e2e',
    border: '1px solid #2d2d44',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e2e8f0',
    margin: 0,
  },
  company: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '4px 0 0',
  },
  industry: {
    fontSize: '12px',
    background: '#2d1f4e',
    color: '#a855f7',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  meta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: '13px',
    color: '#7c85a2',
  },
  skills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  skill: {
    fontSize: '12px',
    background: '#16213e',
    color: '#94a3b8',
    padding: '3px 10px',
    borderRadius: '4px',
  },
  btn: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default JobCard;