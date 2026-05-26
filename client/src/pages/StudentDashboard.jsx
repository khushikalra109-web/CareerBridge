import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, FileText, HeartPulse, Layers } from 'lucide-react';
import Loader from '../components/Loader';
import { fetchJobs } from '../services/jobService';
import { getStudentApplications } from '../services/applicationService';
import { updateProfile, uploadResume } from '../services/authService';

function StudentDashboard({ user, showToast }) {
  const [profile, setProfile] = useState(user);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', skills: user?.skills?.join(', ') || '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

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

    const loadRecommendations = async () => {
      try {
        const skills = form.skills;
        if (!skills) return;
        const { data } = await fetchJobs({ skills, limit: 4 });
        setRecommendedJobs(data.jobs);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      loadApplications();
      loadRecommendations();
    }
  }, [user, form.skills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsList = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      const { data } = await updateProfile({ ...form, skills: skillsList });
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

  const resumeMatchScore = profile?.skills?.length ? Math.min(100, Math.round(profile.skills.length * 12 + 20)) : 0;

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 px-8 py-12 text-white shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Your dashboard helps you manage resumes, review application progress, and discover jobs that match your skills.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Resume score</p>
              <p className="mt-3 text-4xl font-semibold">{resumeMatchScore}%</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Applications</p>
              <p className="mt-3 text-4xl font-semibold">{applications.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-soft">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Resume preview</h2>
            <p className="mt-3 text-sm text-slate-500">Open your uploaded resume or upload the latest version.</p>
            {profile?.resumeUrl ? (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm text-white transition hover:bg-sky-500">View resume</a>
            ) : (
              <p className="mt-5 text-sm text-slate-500">No resume uploaded yet.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Quick stats</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                <span className="text-sm text-slate-500">Active applications</span>
                <span className="font-semibold text-slate-900">{applications.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                <span className="text-sm text-slate-500">Resume score</span>
                <span className="font-semibold text-slate-900">{resumeMatchScore}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {['Applied', 'Under review', 'Shortlisted', 'Accepted'].map((stage, index) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-sky-500" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Update profile</h2>
                <p className="text-sm text-slate-500">Keep your resume and skills up to date for stronger matches.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700">Key skills</label>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Figma, SQL" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700">Upload resume (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-500" />
                {resumeFile && <p className="text-sm text-slate-500">Selected file: {resumeFile.name}</p>}
              </div>
              <button type="submit" disabled={saving} className="sm:col-span-2 rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'}</button>
            </form>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Applications timeline</h2>
                <p className="text-sm text-slate-500">Track status updates from recruiters.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Most recent first</div>
            </div>
            {loading ? (
              <Loader />
            ) : applications.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No applications yet. Start exploring roles from jobs page.</div>
            ) : (
              <div className="mt-8 space-y-4">
                {applications.map((application) => (
                  <motion.div key={application._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{application.jobId?.title}</p>
                        <h3 className="text-lg font-semibold text-slate-900">{application.jobId?.title || 'Role'}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : application.status === 'rejected' ? 'bg-rose-100 text-rose-700' : application.status === 'shortlisted' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{application.status.replace('_', ' ')}</span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="mt-2 text-slate-900">{application.companyId ? application.companyId.name : 'Unknown'}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Resume</p>
                        <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-sky-600">View resume</a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex items-center gap-3 text-slate-900">
              <Code2 size={22} />
              <h2 className="text-2xl font-semibold">Recommended jobs</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">Based on your skills and uploaded resume.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recommendedJobs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Update your skills to see tailored recommendations.</div>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{job.title}</p>
                        <p className="mt-2 text-sm text-slate-500">{job.companyId?.name || 'Company'} • {job.location}</p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{job.jobType}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {job.skills?.slice(0, 3).map((skill) => (<span key={skill} className="rounded-full bg-slate-100 px-3 py-1">{skill}</span>))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
