import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import Loader from '../components/Loader';
import { createJob, deleteJob, fetchCompanyJobs, fetchCompanyAnalytics } from '../services/jobService';
import { getApplicationsForJob, getCompanyApplications, updateApplicationStatus } from '../services/applicationService';

function CompanyDashboard({ user, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeApplications, setActiveApplications] = useState([]);
  const [dashboardCounts, setDashboardCounts] = useState({ totalPublished: 0, totalApplications: 0, accepted: 0 });
  const [analytics, setAnalytics] = useState({ monthlyStats: [] });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', salary: '', location: '', skills: '', category: '', jobType: 'Full-time', experienceLevel: 'Entry level' });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [jobsResponse, applicationsResponse, analyticsResponse] = await Promise.all([
        fetchCompanyJobs(),
        getCompanyApplications(),
        fetchCompanyAnalytics(),
      ]);
      const allApplications = applicationsResponse.data.applications || [];
      const activeApps = allApplications.filter((app) => app.status !== 'rejected');
      const acceptedCount = allApplications.filter((app) => app.status === 'accepted').length;

      setJobs(jobsResponse.data.jobs);
      setActiveApplications(activeApps);
      setDashboardCounts({
        totalPublished: jobsResponse.data.jobs.length,
        totalApplications: activeApps.length,
        accepted: acceptedCount,
      });
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await createJob({
        ...form,
        skills: form.skills,
      });
      setForm({ title: '', description: '', salary: '', location: '', skills: '', category: '', jobType: 'Full-time', experienceLevel: 'Entry level' });
      await loadDashboard();
      showToast('Job posted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to post job', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      await loadDashboard();
      showToast('Job removed');
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const loadApplicants = async (jobId) => {
    try {
      const { data } = await getApplicationsForJob(jobId);
      setApplications(data);
      setSelectedJob(jobId);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load applicants', 'error');
    }
  };

  const changeStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const { data } = await updateApplicationStatus(id, status);
      const updatedApp = data.application || data;

      setApplications((prev) => prev.map((app) => (app._id === id ? { ...app, status: updatedApp.status } : app)));
      setActiveApplications((prev) =>
        prev.reduce((acc, app) => {
          if (app._id === id) {
            if (updatedApp.status !== 'rejected') {
              acc.push({ ...app, status: updatedApp.status });
            }
            return acc;
          }
          acc.push(app);
          return acc;
        }, [])
      );
      setDashboardCounts((prev) => ({
        ...prev,
        totalApplications: updatedApp.status === 'rejected' ? Math.max(prev.totalApplications - 1, 0) : prev.totalApplications,
        accepted: updatedApp.status === 'accepted' ? prev.accepted + 1 : prev.accepted,
      }));

      showToast(updatedApp.status === 'accepted' ? 'Application accepted' : 'Application rejected');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Post a new job</h2>
          <p className="mt-2 text-sm text-slate-500">Create a premium listing to attract student applicants.</p>
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" rows="4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} placeholder="Job type" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              <input required value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} placeholder="Experience level" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            </div>
            <input required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Skills (comma separated)" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <button disabled={posting} className="w-full rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{posting ? 'Posting...' : 'Publish job'}</button>
          </form>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Published jobs</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{dashboardCounts.totalPublished}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Accepted candidates</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{dashboardCounts.accepted}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-slate-900">Monthly applications</h2>
            <div className="mt-6 h-64">
              {analytics.monthlyStats.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No analytics data available yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Your job listings</h2>
            <p className="mt-2 text-sm text-slate-500">Manage openings and check submitted applications.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Fast analytics</div>
        </div>

        {loading ? (
          <Loader />
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No active job posts yet.</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.location} • {job.salary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => loadApplicants(job._id)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">Applicants</button>
                    <button onClick={() => handleDelete(job._id)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Applicants</h2>
            <p className="mt-2 text-sm text-slate-500">Review students and update status for your roles.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">{selectedJob ? 'Selected job applicants' : 'All active applicants'}</span>
        </div>

        {(selectedJob ? applications : activeApplications).length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">{selectedJob ? 'Pick a job to review applicants.' : 'No applications found yet.'}</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {(selectedJob ? applications : activeApplications).map((application) => {
              const statusBadge = application.status === 'accepted'
                ? 'bg-emerald-100 text-emerald-700'
                : application.status === 'rejected'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700';

              return (
                <div key={application._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{application.applicantId?.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadge}`}>{application.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-slate-500">{application.applicantId?.email}</p>
                      <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">View resume</a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => changeStatus(application._id, 'accepted')}
                        disabled={application.status !== 'pending' || actionLoading === application._id}
                        className="rounded-full bg-emerald-100 px-4 py-2 text-sm text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >Accept</button>
                      <button
                        onClick={() => changeStatus(application._id, 'rejected')}
                        disabled={application.status !== 'pending' || actionLoading === application._id}
                        className="rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >Reject</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default CompanyDashboard;
