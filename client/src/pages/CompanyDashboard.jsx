import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { createJob, deleteJob, fetchJobs } from '../services/jobService';
import { getApplicationsForJob, updateApplicationStatus } from '../services/applicationService';

function CompanyDashboard({ user, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', salary: '', location: '', skills: '', category: '' });

  const companyJobs = useMemo(() => jobs.filter((job) => job.companyId?._id === user?.id), [jobs, user]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await fetchJobs();
      setJobs(data.jobs);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await createJob({ ...form, skills: form.skills });
      setForm({ title: '', description: '', salary: '', location: '', skills: '', category: '' });
      await loadJobs();
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
      await loadJobs();
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
    try {
      await updateApplicationStatus(id, status);
      if (selectedJob) loadApplicants(selectedJob);
      showToast('Application status updated');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Post a new job</h2>
        <p className="mt-2 text-sm text-slate-500">Create a premium listing to attract student applicants.</p>
        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" rows="4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          </div>
          <input required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Skills (comma separated)" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          <button disabled={posting} className="w-full rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{posting ? 'Posting...' : 'Publish job'}</button>
        </form>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Your job listings</h2>
        <p className="mt-2 text-sm text-slate-500">Manage openings and check submitted applications.</p>
        {loading ? (
          <Loader />
        ) : companyJobs.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No active job posts yet.</div>
        ) : (
          <div className="mt-8 space-y-4">
            {companyJobs.map((job) => (
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

      <section className="xl:col-span-2 rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Applicants</h2>
            <p className="mt-2 text-sm text-slate-500">Review students and update status for your latest openings.</p>
          </div>
          {selectedJob && <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Showing applicants for selected job</span>}
        </div>
        {applications.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Select a job to view applicants.</div>
        ) : (
          <div className="mt-8 space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{application.studentId?.name}</h3>
                    <p className="text-sm text-slate-500">{application.studentId?.email}</p>
                    <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">View resume</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => changeStatus(application._id, 'accepted')} className="rounded-full bg-emerald-100 px-4 py-2 text-sm text-emerald-700 transition hover:bg-emerald-200">Accept</button>
                    <button onClick={() => changeStatus(application._id, 'rejected')} className="rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-200">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CompanyDashboard;
