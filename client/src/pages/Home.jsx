import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Layers, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import Footer from '../components/Footer';
import { fetchJobs } from '../services/jobService';

const companyLogos = ['Pioneer', 'Nexa', 'Horizon', 'Atlas'];
const stats = [
  { label: 'Jobs available', value: '2.3K+' },
  { label: 'Companies', value: '430+' },
  { label: 'Students hired', value: '1.9K+' },
  { label: 'Recruiters active', value: '450+' },
];
const faq = [
  { q: 'How do I upload my resume?', a: 'Go to your student dashboard and upload a PDF resume to start applying instantly.' },
  { q: 'Can companies review resumes directly?', a: 'Yes, all company applicants can open a student resume from the application panel.' },
  { q: 'How do I save jobs?', a: 'Bookmark any job on the jobs page and access it later from your dashboard.' },
];

function Home({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetchJobs({ search, location, skills, limit: 6 });
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
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[40px] bg-slate-950 px-6 py-16 text-white shadow-soft sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_30%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl space-y-6">
            <span className="inline-flex rounded-full bg-sky-500/20 px-4 py-2 text-sm uppercase tracking-[0.3em] text-sky-200">Campus hiring reimagined</span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Launch your career with smarter job matches and recruiter-ready resume tools.</h1>
            <p className="max-w-xl text-lg text-slate-300">CareerBridge combines curated roles, resume feedback, application tracking, and analytics to help students and companies connect faster.</p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-sky-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400">Explore jobs</button>
              <button className="rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/30">See student stories</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="grid gap-4 rounded-[32px] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 sm:w-[520px]">
            <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-950/90 p-5">
              <div>
                <p className="text-sm text-slate-400">Live talent score</p>
                <p className="mt-2 text-3xl font-semibold text-white">82%</p>
              </div>
              <div className="rounded-3xl bg-sky-500/10 p-3 text-sky-300"><Sparkles size={28} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {['Resume AI', 'Role insights', 'Fast hiring', 'Verified firms'].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-sm text-slate-400">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="space-y-8 rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-2">
            <span className="text-sm uppercase tracking-[0.28em] text-sky-500">Top hiring partners</span>
            <h2 className="text-3xl font-semibold text-slate-900">Leading companies trust CareerBridge</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {companyLogos.map((name) => (
              <div key={name} className="rounded-3xl border border-slate-200 p-6 text-center">
                <p className="text-xl font-semibold text-slate-900">{name}</p>
                <p className="mt-2 text-sm text-slate-500">Campus hiring partner</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
          <div className="flex items-center gap-4 text-slate-200">
            <div className="rounded-3xl bg-sky-500/10 p-3"><Globe size={24} /></div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Why CareerBridge</p>
              <p className="text-xl font-semibold">A polished hiring experience for every campus.</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Resume builder promotion</p>
              <p className="mt-2 text-sm text-slate-300">Upload once and apply everywhere with smart resume matching and ATS-friendly scoring.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Student success</p>
              <p className="mt-2 text-sm text-slate-300">Track every application with timeline stages and recruiter updates.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm uppercase tracking-[0.28em] text-sky-500">How it works</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">From signup to offer letter</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Students & recruiters</span>
          </div>
          <div className="mt-8 grid gap-4">
            {['Create profile', 'Search smart jobs', 'Upload resume', 'Track applications'].map((step, index) => (
              <div key={step} className="rounded-3xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Step {index + 1}</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
          <h2 className="text-3xl font-semibold">Featured jobs</h2>
          <p className="mt-3 text-sm text-slate-400">Handpicked roles for ambitious students.</p>
          <div className="mt-8 space-y-4">
            {loading ? (
              <Loader />
            ) : jobs.slice(0, 4).map((job) => (
              <motion.div key={job._id} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{job.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{job.companyId?.name || 'Company name'}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">{job.jobType || 'Full-time'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-3">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Testimonials</h2>
          <p className="mt-3 text-sm text-slate-500">Real students and recruiters who love the platform.</p>
          <div className="mt-8 space-y-5">
            {['“Helped me land my first internship.”', '“Hiring was streamlined and powerful.”', '“Analytics helped our team close offers faster.”'].map((quote) => (
              <div key={quote} className="rounded-3xl border border-slate-200 p-5">
                <p className="text-slate-700">{quote}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Latest jobs preview</h2>
          <div className="mt-6 space-y-4">
            {jobs.slice(0, 3).map((job) => (
              <div key={job._id} className="rounded-3xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{job.location} • {job.salary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Resume builder promotion</h2>
          <p className="mt-3 text-sm text-slate-500">Achieve better match scores by keeping your skills and resume updated with every application.</p>
          <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">Upload once, apply instantly, and track every recruiter review.</p>
            <div className="rounded-3xl bg-sky-100 px-4 py-3 text-sky-700">Get smarter suggestions based on your skills.</div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">FAQ</h2>
            <p className="mt-2 text-sm text-slate-500">Common questions from students and recruiters.</p>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm text-white transition hover:bg-slate-800">Contact support</button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <div key={item.q} className="rounded-3xl border border-slate-200 p-6">
              <p className="font-semibold text-slate-900">{item.q}</p>
              <p className="mt-3 text-sm text-slate-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
