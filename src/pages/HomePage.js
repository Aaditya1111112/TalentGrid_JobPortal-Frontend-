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
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }

  function handleSearch() {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (experience) params.experience = experience;
    fetchJobs(params);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div>
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find Your Dream Job</h1>
        <p style={s.heroSub}>Thousands of jobs from top companies across India</p>
        <div style={s.searchBar}>
          <input style={s.input} placeholder="Job title or keyword" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={handleKeyDown} />
          <input style={s.input} placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} onKeyDown={handleKeyDown} />
          <input style={{ ...s.input, width: '140px' }} placeholder="Experience (yrs)" type="number" value={experience} onChange={e => setExperience(e.target.value)} onKeyDown={handleKeyDown} />
          <button style={s.searchBtn} onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div style={s.section}>
        <h2 style={s.sectionTitle}>{loading ? 'Loading...' : `${jobs.length} Jobs Found`}</h2>
        <div style={s.grid}>
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
        {!loading && jobs.length === 0 && <p style={s.empty}>No jobs found. Try different filters.</p>}
      </div>
    </div>
  );
}

const s = {
  hero: { background: 'linear-gradient(135deg, #0f0f13, #1a0533)', padding: '60px 40px', textAlign: 'center', color: '#fff' },
  heroTitle: { fontSize: '40px', fontWeight: '700', margin: '0 0 12px' },
  heroSub: { fontSize: '16px', opacity: 0.75, margin: '0 0 32px' },
  searchBar: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  input: { padding: '12px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', width: '220px', outline: 'none', background: '#1e1e2e', color: '#e2e8f0' },
  searchBtn: { padding: '12px 28px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  section: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '15px', marginTop: '40px' },
};

export default HomePage;