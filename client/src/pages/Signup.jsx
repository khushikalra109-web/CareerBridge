import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

function Signup({ setUser, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', company: { website: '', location: '', description: '' } });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      const normalizedUser = { ...data.user, _id: data.user._id || data.user.id };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      showToast('Signup successful');
      navigate(normalizedUser.role === 'student' ? '/student' : normalizedUser.role === 'company' ? '/company' : '/admin');
    } catch (error) {
      showToast(error.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[32px] bg-white p-10 shadow-soft">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-3 text-sm text-slate-500">Students, companies, and admins can join the platform.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Role
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500">
            <option value="student">Student</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {form.role === 'company' && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Company details</h2>
            <label className="block text-sm font-medium text-slate-700">
              Website
              <input value={form.company.website} onChange={(e) => setForm({ ...form, company: { ...form.company, website: e.target.value } })} className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700 mt-4">
              Location
              <input value={form.company.location} onChange={(e) => setForm({ ...form, company: { ...form.company, location: e.target.value } })} className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700 mt-4">
              Description
              <textarea value={form.company.description} onChange={(e) => setForm({ ...form, company: { ...form.company, description: e.target.value } })} className="mt-2 h-24 w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            </label>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link to="/login" className="font-semibold text-sky-600">Login here</Link>
      </p>
    </div>
  );
}

export default Signup;
