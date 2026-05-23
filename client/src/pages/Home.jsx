import { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import { fetchJobs } from '../services/jobService';

function Home({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetchJobs({ search, location, skills });
      setJobs(response.data.jobs);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-700 to-sky-700 px-8 py-14 text-white shadow-soft">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Your next internship or entry-level job is waiting.</h1>
          <p className="mt-4 text-lg text-slate-200">Browse student-friendly roles, upload your resume, and apply to companies all in one place.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-200">Students</p>
              <p className="mt-2 text-2xl font-semibold">Find roles</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-200">Companies</p>
              <p className="mt-2 text-2xl font-semibold">Hire talent</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-200">Admins</p>
              <p className="mt-2 text-2xl font-semibold">Control panel</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 rounded-[32px] bg-white p-8 shadow-soft md:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Explore</span>
            <p className="text-sm text-slate-500">Filter by location, keywords, and skills.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="col-span-2 rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
          </div>
          <button onClick={loadJobs} className="mt-6 rounded-full bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700">Search jobs</button>
        </div>
        <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Featured</p>
          <h2 className="mt-4 text-2xl font-semibold">Browse trending skill sets</h2>
          <div className="mt-6 grid gap-3">
            {['JavaScript', 'React', 'UI/UX', 'Node.js', 'Python', 'Digital Marketing'].map((tag) => (
              <span key={tag} className="inline-flex rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Available jobs</h2>
            <p className="text-sm text-slate-500">Carefully curated opportunities for students and new grads.</p>
          </div>
          <p className="text-sm text-slate-500">{jobs.length} roles found</p>
        </div>

        {loading ? (
          <Loader />
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No jobs found. Try a broader search.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (<JobCard key={job._id} job={job} />))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
