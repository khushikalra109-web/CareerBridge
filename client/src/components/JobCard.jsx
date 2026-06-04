import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Sparkles } from 'lucide-react';

function JobCard({ job, onToggleSave, saved, layout = 'grid', matchInfo }) {
  const status = matchInfo?.matchPercentage >= 75 ? 'Excellent match' : matchInfo?.matchPercentage >= 50 ? 'Good fit' : 'Needs improvement';
  const statusClass = matchInfo?.matchPercentage >= 75
    ? 'bg-emerald-100 text-emerald-700'
    : matchInfo?.matchPercentage >= 50
      ? 'bg-sky-100 text-sky-700'
      : 'bg-amber-100 text-amber-700';

  return (
    <div className={`group w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl ${layout === 'list' ? 'flex flex-col justify-between' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-slate-900 break-words">{job.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{job.companyId?.name || 'Company'} · {job.location}</p>
        </div>
        <button onClick={onToggleSave} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${saved ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Bookmark size={14} className="inline-block align-middle" />
          <span className="ml-2">{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><Sparkles size={14} /> {job.experienceLevel}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><MapPin size={14} /> {job.location}</span>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

      {matchInfo && (
        <div className="mt-5 rounded-3xl bg-slate-50 p-4">
          <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <span>Resume match</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div style={{ width: `${matchInfo.matchPercentage}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-cyan-400" />
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:justify-between">
            <span>{matchInfo.matchPercentage}% match</span>
            <span>{matchInfo.matchedSkills.length} skills matched</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {matchInfo.matchedSkills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 break-words">{skill}</span>
            ))}
            {matchInfo.missingSkills.length > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">{matchInfo.missingSkills.length} skills missing</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-sky-600 transition hover:text-sky-800">View details</Link>
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{job.jobType || 'Full-time'}</span>
      </div>
    </div>
  );
}

export default JobCard;
