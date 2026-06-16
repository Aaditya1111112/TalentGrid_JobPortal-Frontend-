import { useState, useEffect } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';

function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => { fetchJobs(); }, []);

  function fetchJobs(params = {}) {
    setLoading(true);
    api.get('/jobs', { params })
      .then(res => setJobs(res.data.data.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  function handleSearch() {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (experience) params.experience = experience;
    fetchJobs(params);
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={s.eyebrow}>Job Portal · India</div>
            <h1 style={s.heroTitle}>
              Find work that<br />
              <em style={s.italic}>actually fits.</em>
            </h1>
            <p style={s.heroSub}>
              Thousands of verified listings from companies hiring right now.
            </p>
          </div>
          <div style={s.heroRight}>
            <div style={s.searchCard}>
              <label style={s.label}>Keyword</label>
              <input
                style={s.input}
                placeholder="e.g. Backend Developer"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <label style={s.label}>Location</label>
              <input
                style={s.input}
                placeholder="e.g. Delhi, Bangalore"
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <label style={s.label}>Experience</label>
              <input
                style={s.input}
                placeholder="Years of experience"
                type="number"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button style={s.searchBtn} onClick={handleSearch}>
                Search Jobs →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.listHeader}>
          <span style={s.listCount}>
            {loading ? 'Searching...' : `${jobs.length} positions`}
          </span>
          <div style={s.divider} />
        </div>

        {!loading && jobs.length === 0 && (
          <div style={s.empty}>
            <p style={s.emptyTitle}>No results</p>
            <p style={s.emptySub}>Try adjusting your search filters.</p>
          </div>
        )}

        <div style={s.grid}>
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 56px)' },
  hero: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    padding: '64px 32px',
  },
  heroInner: {
    maxWidth: '1080px', margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '64px', alignItems: 'center',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: '20px' },
  eyebrow: {
    fontSize: '12px', fontWeight: '500',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '1px',
    fontFamily: 'var(--mono)',
  },
  heroTitle: {
    fontSize: '52px', fontWeight: '300',
    color: 'var(--text-primary)', lineHeight: 1.1,
    letterSpacing: '-1.5px',
  },
  italic: { fontStyle: 'italic', fontWeight: '300' },
  heroSub: { fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '380px' },
  heroRight: {},
  searchCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
  },
  searchBtn: {
    marginTop: '4px',
    padding: '11px 16px',
    background: 'var(--accent)',
    color: 'var(--accent-fg)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '-0.1px',
  },
  main: { maxWidth: '1080px', margin: '0 auto', padding: '40px 32px' },
  listHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  listCount: { fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  divider: { flex: 1, height: '1px', background: 'var(--border)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: 'var(--text-tertiary)' },
};

export default HomePage;