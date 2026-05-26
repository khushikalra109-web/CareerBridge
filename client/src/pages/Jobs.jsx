import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, List, Grid, ArrowRight } from 'lucide-react';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import { fetchJobs, fetchRecommendedJobs, fetchSavedJobs, toggleSavedJob } from '../services/jobService';

const experienceOptions = ['Entry level', 'Mid level', 'Senior level'];
const typeOptions = ['Full-time', 'Part-time', 'Internship', 'Remote'];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Popular', value: 'popular' },
];

function Jobs({ user, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = { search, location, skills, jobType, experienceLevel, sort, page, limit: 12 };
      const { data } = await fetchJobs(params);
      setJobs(data.jobs);
      setPages(data.pages);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSaved = async () => {
    if (!user) return;
    try {
      const { data } = await fetchSavedJobs();
      setSavedJobs(data.savedJobs.map((job) => job._id));
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecommended = async () => {
    if (!user) return;
    try {
      const { data } = await fetchRecommendedJobs();
      setRecommended(data.jobs);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, location, skills, jobType, experienceLevel, sort, page]);

  useEffect(() => {
    loadSaved();
    loadRecommended();
  }, [user]);

  const handleSaveToggle = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
      setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
      showToast('Saved jobs updated');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to update bookmark', 'error');
    }
  };

  const pagesArray = useMemo(() => Array.from({ length: pages }, (_, idx) => idx + 1), [pages]);

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 px-8 py-12 text-white shadow-soft">
        <div className="max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-300">Smart hiring hub</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">Discover premium jobs and internships tailored to your profile.</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">Advanced search, recommended roles, and a recruiter-ready candidate experience for students and companies.</p>
          </motion.div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6 rounded-[32px] bg-white p-6 shadow-soft">
          <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Refine search</p>
            <h2 className="mt-4 text-2xl font-semibold">Filters</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 p-4">
              <label className="text-sm font-medium text-slate-700">Job title or keywords</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="UX designer, Python, finance" className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-sky-500" />
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-sky-500" />
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <label className="text-sm font-medium text-slate-700">Skills</label>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, SQL, design" className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-sky-500" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-4">
                <label className="text-sm font-medium text-slate-700">Experience</label>
                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-sky-500">
                  <option value="">Any</option>
                  {experienceOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4">
                <label className="text-sm font-medium text-slate-700">Job type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-sky-500">
                  <option value="">Any</option>
                  {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{jobs.length} opportunities</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Search results</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-700">Sorted by</span>
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-500">
                  {sortOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <button onClick={() => setViewMode('grid')} className={`rounded-full border px-3 py-2 transition ${viewMode === 'grid' ? 'border-sky-600 bg-sky-100 text-sky-700' : 'border-slate-200 bg-white text-slate-600'}`}><Grid size={16} /></button>
                <button onClick={() => setViewMode('list')} className={`rounded-full border px-3 py-2 transition ${viewMode === 'list' ? 'border-sky-600 bg-sky-100 text-sky-700' : 'border-slate-200 bg-white text-slate-600'}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No matches found. Try loosening the filter criteria.</div>
          ) : (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : ''}`}>
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  layout={viewMode}
                  saved={savedJobs.includes(job._id)}
                  onToggleSave={() => handleSaveToggle(job._id)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] bg-white px-6 py-4 shadow-soft">
            <p className="text-sm text-slate-500">Page {page} of {pages}</p>
            <div className="flex flex-wrap gap-2">
              {pagesArray.map((pageNumber) => (
                <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`rounded-full px-4 py-2 text-sm transition ${pageNumber === page ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>

          {recommended.length > 0 && (
            <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Recommended for you</p>
                  <h3 className="mt-3 text-2xl font-semibold">Jobs based on your profile</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300">
                  <ArrowRight size={16} /> See more
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {recommended.map((job) => (
                  <div key={job._id} className="rounded-3xl bg-slate-900 p-5 shadow-lg">
                    <p className="text-sm text-slate-400">{job.companyId?.name || 'Company'}</p>
                    <h4 className="mt-3 text-lg font-semibold text-white">{job.title}</h4>
                    <p className="mt-3 text-sm text-slate-400">{job.location} • {job.jobType}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 3).map((skill) => (<span key={skill} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{skill}</span>))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Jobs;
