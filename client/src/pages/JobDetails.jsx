import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { fetchJobById } from '../services/jobService';
import { applyJob } from '../services/applicationService';

function JobDetails({ user, showToast }) {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const { data } = await fetchJobById(id);
        setJob(data);
      } catch (error) {
        showToast(error.response?.data?.message || 'Unable to load job', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showToast('Please attach your resume in PDF format.', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('jobId', id);
    formData.append('resume', resumeFile);
    setSubmitting(true);
    try {
      await applyJob(formData);
      showToast('Application submitted successfully');
      setResumeFile(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Apply failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!job) return <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-soft">Job not found.</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-[32px] bg-white p-10 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{job.title}</h1>
            <p className="mt-3 text-slate-500">{job.location} • {job.salary} • {job.category}</p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">{job.companyId?.name || 'Company'}</span>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Job description</h2>
            <p className="mt-4 text-slate-600 leading-7">{job.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Skills required</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (<span key={skill} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">{skill}</span>))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Posted on</p>
              <p className="mt-4 text-lg font-semibold text-slate-900">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-6">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Application</h2>
          <p className="mt-2 text-sm text-slate-500">Submit your resume to apply for this position.</p>
          {user?.role === 'student' ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">Resume (PDF only)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="w-full text-sm text-slate-600" />
              <button type="submit" disabled={submitting} className="w-full rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Applying...' : 'Apply now'}</button>
            </form>
          ) : (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Sign in as a student to apply for this role.
            </div>
          )}
        </div>
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Company overview</h3>
          <p className="mt-3 text-sm text-slate-500">{job.companyId?.company?.description || 'No company details available.'}</p>
          {job.companyId?.company?.website && <a href={job.companyId.company.website} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200">Visit website</a>}
        </div>
      </aside>
    </div>
  );
}

export default JobDetails;
