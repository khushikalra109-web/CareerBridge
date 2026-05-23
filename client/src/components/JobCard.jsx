import { Link } from 'react-router-dom';

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job._id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.location} · {job.salary}</p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{job.category || 'General'}</span>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills?.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{skill}</span>
        ))}
      </div>
    </Link>
  );
}

export default JobCard;
