import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }
  function handleDashboard() {
    if (auth.role === 'SEEKER') navigate('/seeker/dashboard');
    else navigate('/employer/dashboard');
  }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>
        <span style={s.logoMark}>TG</span>
        <span style={s.logoText}>TalentGrid</span>
      </Link>
      <div style={s.center}>
        <Link to="/" style={s.navLink}>Browse Jobs</Link>
      </div>
      <div style={s.right}>
        {auth ? (
          <>
            <button onClick={handleDashboard} style={s.ghostBtn}>Dashboard</button>
            <button onClick={handleLogout} style={s.solidBtn}>Logout</button>
          </>
        ) : (
          <Link to="/auth" style={s.solidBtn}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '56px',
    background: 'rgba(250,250,248,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: {
    width: '28px', height: '28px',
    background: 'var(--accent)', color: 'var(--accent-fg)',
    borderRadius: '6px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px', fontWeight: '600',
    letterSpacing: '0.5px',
  },
  logoText: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.2px' },
  center: { display: 'flex', gap: '4px' },
  navLink: { padding: '6px 12px', color: 'var(--text-secondary)', fontSize: '14px', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s' },
  right: { display: 'flex', alignItems: 'center', gap: '8px' },
  ghostBtn: {
    padding: '7px 14px', background: 'transparent',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer',
  },
  solidBtn: {
    padding: '7px 14px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', color: 'var(--accent-fg)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center',
  },
};

export default Navbar;