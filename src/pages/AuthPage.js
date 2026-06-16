import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('SEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '', password: '', role: 'SEEKER',
    firstName: '', lastName: '',
    companyName: '', industry: '', companyWebsite: '',
  });

  function handleRoleToggle(r) { setRole(r); setRegisterForm({ ...registerForm, role: r }); }

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', loginForm);
      login(res.data.data);
      if (res.data.data.role === 'SEEKER') navigate('/seeker/dashboard');
      else navigate('/employer/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/register', { email: registerForm.email, password: registerForm.password, role: registerForm.role });
      const res = await api.post('/auth/login', { email: registerForm.email, password: registerForm.password });
      login(res.data.data);
      if (role === 'SEEKER') {
        await api.put('/seekers/me', { firstName: registerForm.firstName, lastName: registerForm.lastName });
        navigate('/seeker/dashboard');
      } else {
        await api.put('/employers/me', { companyName: registerForm.companyName, industry: registerForm.industry, companyWebsite: registerForm.companyWebsite });
        navigate('/employer/dashboard');
      }
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <Link to="/" style={s.backLink}>← Back to jobs</Link>
          <div style={s.leftContent}>
            <div style={s.quote}>"The best way to predict the future is to create it."</div>
            <div style={s.quoteAttrib}>— Peter Drucker</div>
          </div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.form}>
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={s.formSub}>
              {tab === 'login'
                ? <>No account? <button style={s.switchBtn} onClick={() => { setTab('register'); setError(''); }}>Sign up</button></>
                : <>Have an account? <button style={s.switchBtn} onClick={() => { setTab('login'); setError(''); }}>Sign in</button></>
              }
            </p>
          </div>

          {error && <div style={s.error}>{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={s.fields}>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <button style={s.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={s.fields}>
              <div style={s.roleRow}>
                <button type="button" style={role === 'SEEKER' ? s.roleActive : s.roleBtn} onClick={() => handleRoleToggle('SEEKER')}>Job Seeker</button>
                <button type="button" style={role === 'EMPLOYER' ? s.roleActive : s.roleBtn} onClick={() => handleRoleToggle('EMPLOYER')}>Employer</button>
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="you@example.com" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
              </div>
              {role === 'SEEKER' && (
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>First name</label>
                    <input style={s.input} placeholder="FirstName" value={registerForm.firstName} onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Last name</label>
                    <input style={s.input} placeholder="LastName" value={registerForm.lastName} onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
                  </div>
                </div>
              )}
              {role === 'EMPLOYER' && (
                <>
                  <div style={s.field}>
                    <label style={s.label}>Company name</label>
                    <input style={s.input} placeholder="Acme Inc." value={registerForm.companyName} onChange={e => setRegisterForm({ ...registerForm, companyName: e.target.value })} required />
                  </div>
                  <div style={s.row}>
                    <div style={s.field}>
                      <label style={s.label}>Industry</label>
                      <input style={s.input} placeholder="Fintech" value={registerForm.industry} onChange={e => setRegisterForm({ ...registerForm, industry: e.target.value })} />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Website</label>
                      <input style={s.input} placeholder="acme.com" value={registerForm.companyWebsite} onChange={e => setRegisterForm({ ...registerForm, companyWebsite: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
              <button style={s.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  left: {
    width: '420px', flexShrink: 0,
    background: 'var(--accent)', color: 'var(--accent-fg)',
    padding: '48px', display: 'flex', flexDirection: 'column',
  },
  leftInner: { display: 'flex', flexDirection: 'column', height: '100%' },
  backLink: { fontSize: '13px', color: 'rgba(250,250,248,0.6)', textDecoration: 'none', marginBottom: 'auto' },
  leftContent: { marginTop: 'auto', paddingTop: '48px' },
  quote: { fontSize: '22px', fontWeight: '300', lineHeight: 1.5, letterSpacing: '-0.3px', fontStyle: 'italic', marginBottom: '16px' },
  quoteAttrib: { fontSize: '13px', color: 'rgba(250,250,248,0.5)', fontFamily: 'var(--mono)' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: 'var(--bg)' },
  form: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '32px' },
  formHeader: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formTitle: { fontSize: '28px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  formSub: { fontSize: '14px', color: 'var(--text-secondary)' },
  switchBtn: { background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', fontWeight: '500', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' },
  fields: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', fontSize: '14px',
    background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
  },
  roleRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  roleBtn: {
    padding: '10px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer',
  },
  roleActive: {
    padding: '10px', background: 'var(--accent)',
    border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', color: 'var(--accent-fg)', cursor: 'pointer', fontWeight: '500',
  },
  submitBtn: {
    padding: '12px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontSize: '14px', fontWeight: '500', color: 'var(--accent-fg)',
    cursor: 'pointer', marginTop: '8px',
  },
  error: {
    padding: '12px', background: 'var(--red-bg)',
    border: '1px solid #f5c6c6', borderRadius: 'var(--radius-sm)',
    fontSize: '13px', color: 'var(--red)',
  },
};

export default AuthPage;