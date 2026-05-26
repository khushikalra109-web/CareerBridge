import { Link } from 'react-router-dom';
import { Bell, MessageCircle, UserCircle } from 'lucide-react';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/jobs?category=Company' },
];

function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">CareerBridge</Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-600 md:justify-start">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="transition hover:text-slate-900">{item.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/notifications" className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:text-slate-900" title="Notifications"><Bell size={18} /></Link>
              <Link to="/chat" className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:text-slate-900" title="Messages"><MessageCircle size={18} /></Link>
              <Link to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                <UserCircle size={18} />
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={onLogout} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700">Login</Link>
              <Link to="/signup" className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
