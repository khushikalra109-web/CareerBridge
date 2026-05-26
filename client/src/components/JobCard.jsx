import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Sparkles } from 'lucide-react';

function JobCard({ job, onToggleSave, saved, layout = 'grid' }) {
  return (
    <div className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl ${layout === 'list' ? 'flex flex-col justify-between' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{job.companyId?.name || 'Company'} · {job.location}</p>
        </div>
        <button onClick={onToggleSave} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${saved ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Bookmark size={14} className="inline-block align-middle" />
          <span className="ml-2">{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="mt-5 flex items-center flex-wrap gap-2 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><Sparkles size={14} /> {job.experienceLevel}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><MapPin size={14} /> {job.location}</span>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills?.slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{skill}</span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-sky-600 transition hover:text-sky-800">View details</Link>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{job.jobType || 'Full-time'}</span>
      </div>
    </div>
  );
}

export default JobCard;
