import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleDashboard() {
    if (auth.role === 'SEEKER') navigate('/seeker/dashboard');
    else if (auth.role === 'EMPLOYER') navigate('/employer/dashboard');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>TalentGrid</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Browse Jobs</Link>
        {auth ? (
          <>
            <button onClick={handleDashboard} style={styles.btn}>Dashboard</button>
            <button onClick={handleLogout} style={styles.btnOutline}>Logout</button>
          </>
        ) : (
          <Link to="/auth" style={styles.btn}>Login / Sign Up</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 40px',
    height: '60px',
    background: '#13131f',
    borderBottom: '1px solid #2d2d44',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#a855f7',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  link: {
    textDecoration: 'none',
    color: '#94a3b8',
    fontSize: '14px',
  },
  btn: {
    padding: '8px 18px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  btnOutline: {
    padding: '8px 18px',
    background: 'transparent',
    color: '#a855f7',
    border: '1px solid #7c3aed',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Navbar;