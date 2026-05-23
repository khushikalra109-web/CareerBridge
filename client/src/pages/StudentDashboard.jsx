import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { getStudentApplications } from '../services/applicationService';
import { updateProfile, uploadResume } from '../services/authService';

function StudentDashboard({ user, showToast }) {
  const [profile, setProfile] = useState(user);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const { data } = await getStudentApplications();
        setApplications(data);
      } catch (error) {
        showToast(error.response?.data?.message || 'Unable to fetch applications', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) loadApplications();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      let updatedUser = data;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const resumeResponse = await uploadResume(formData);
        updatedUser = resumeResponse.data;
      }
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setResumeFile(null);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Student Profile</h2>
        <p className="mt-3 text-sm text-slate-500">Manage your resume and personal details.</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-2 font-semibold text-slate-900">Student</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Resume</p>
            <p className="mt-2 text-slate-900">{profile?.resumeUrl ? <a href={profile.resumeUrl} className="text-sky-600 underline">View uploaded PDF</a> : 'No resume uploaded yet'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Edit profile</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <label className="block text-sm font-medium text-slate-700">Upload resume (PDF)</label>
            <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-500" />
            {resumeFile && <p className="text-sm text-slate-500">Selected file: {resumeFile.name}</p>}
            <button disabled={saving} className="rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
          </form>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Applied jobs</h2>
              <p className="mt-2 text-sm text-slate-500">Track your application progress in one place.</p>
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : applications.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">You haven't applied to any jobs yet.</div>
          ) : (
            <div className="mt-8 space-y-4">
              {applications.map((application) => (
                <div key={application._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{application.jobId?.title || 'Role'}</h3>
                      <p className="text-sm text-slate-500">{application.jobId?.location || 'Remote'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : application.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{application.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
