import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

function Login({ setUser, showToast }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      showToast('Login successful');
      navigate(data.user.role === 'student' ? '/student' : data.user.role === 'company' ? '/company' : '/admin');
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[32px] bg-white p-10 shadow-soft">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-500">Sign in to access student and company dashboards.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
        <button type="submit" disabled={loading} className="w-full rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New here? <Link to="/signup" className="font-semibold text-sky-600">Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
