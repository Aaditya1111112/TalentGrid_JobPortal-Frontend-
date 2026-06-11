import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', role: 'SEEKER', firstName: '', lastName: '', companyName: '', industry: '', companyWebsite: '' });

  function handleRoleToggle(selectedRole) {
    setRole(selectedRole);
    setRegisterForm({ ...registerForm, role: selectedRole });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginForm);
      login(res.data.data);
      if (res.data.data.role === 'SEEKER') navigate('/seeker/dashboard');
      else navigate('/employer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { email: registerForm.email, password: registerForm.password, role: registerForm.role });
      const loginRes = await api.post('/auth/login', { email: registerForm.email, password: registerForm.password });
      login(loginRes.data.data);
      if (role === 'SEEKER') {
        await api.put('/seekers/me', { firstName: registerForm.firstName, lastName: registerForm.lastName });
        navigate('/seeker/dashboard');
      } else {
        await api.put('/employers/me', { companyName: registerForm.companyName, industry: registerForm.industry, companyWebsite: registerForm.companyWebsite });
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Welcome to TalentGrid</h2>
        <div style={s.tabs}>
          <button style={tab === 'login' ? s.tabActive : s.tab} onClick={() => { setTab('login'); setError(''); }}>Login</button>
          <button style={tab === 'register' ? s.tabActive : s.tab} onClick={() => { setTab('register'); setError(''); }}>Sign Up</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={s.form}>
            <input style={s.input} type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
            <input style={s.input} type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
            <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={s.form}>
            <div style={s.roleToggle}>
              <button type="button" style={role === 'SEEKER' ? s.roleActive : s.roleBtn} onClick={() => handleRoleToggle('SEEKER')}>I'm a Job Seeker</button>
              <button type="button" style={role === 'EMPLOYER' ? s.roleActive : s.roleBtn} onClick={() => handleRoleToggle('EMPLOYER')}>I'm an Employer</button>
            </div>
            <input style={s.input} type="email" placeholder="Email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required />
            <input style={s.input} type="password" placeholder="Password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
            {role === 'SEEKER' && <>
              <input style={s.input} placeholder="First Name" value={registerForm.firstName} onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
              <input style={s.input} placeholder="Last Name" value={registerForm.lastName} onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
            </>}
            {role === 'EMPLOYER' && <>
              <input style={s.input} placeholder="Company Name" value={registerForm.companyName} onChange={e => setRegisterForm({ ...registerForm, companyName: e.target.value })} required />
              <input style={s.input} placeholder="Industry" value={registerForm.industry} onChange={e => setRegisterForm({ ...registerForm, industry: e.target.value })} />
              <input style={s.input} placeholder="Company Website" value={registerForm.companyWebsite} onChange={e => setRegisterForm({ ...registerForm, companyWebsite: e.target.value })} />
            </>}
            <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f13' },
  card: { background: '#1e1e2e', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', border: '1px solid #2d2d44' },
  title: { textAlign: 'center', fontSize: '22px', fontWeight: '700', color: '#e2e8f0', marginBottom: '24px' },
  tabs: { display: 'flex', marginBottom: '24px', borderBottom: '2px solid #2d2d44' },
  tab: { flex: 1, padding: '10px', background: 'none', border: 'none', fontSize: '15px', color: '#94a3b8', cursor: 'pointer', paddingBottom: '12px' },
  tabActive: { flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: '2px solid #7c3aed', fontSize: '15px', color: '#a855f7', fontWeight: '600', cursor: 'pointer', marginBottom: '-2px', paddingBottom: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '12px 14px', border: '1px solid #2d2d44', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', background: '#13131f', color: '#e2e8f0' },
  btn: { padding: '13px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  roleToggle: { display: 'flex', gap: '10px', marginBottom: '4px' },
  roleBtn: { flex: 1, padding: '10px', background: '#13131f', border: '1px solid #2d2d44', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#94a3b8' },
  roleActive: { flex: 1, padding: '10px', background: '#2d1f4e', border: '1px solid #7c3aed', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#a855f7', fontWeight: '600' },
  error: { background: '#2d0a0a', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
};

export default AuthPage;