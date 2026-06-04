import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageCircle, UserCircle, Menu, X } from 'lucide-react';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/jobs?category=Company' },
];

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">CareerBridge</Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-slate-600 md:flex">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="transition hover:text-slate-900">{item.label}</Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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

      <div className={`fixed inset-x-0 top-[68px] z-40 overflow-hidden bg-white/98 pb-6 shadow-xl transition duration-300 md:hidden ${menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="mx-auto max-w-7xl space-y-4 px-4 pt-5 sm:px-6">
          <nav className="flex flex-col gap-3 text-base font-medium text-slate-700">
            {links.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            {user ? (
              <>
                <Link to="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                  <Bell size={18} /> Notifications
                </Link>
                <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                  <MessageCircle size={18} /> Chat
                </Link>
                <Link to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                  <UserCircle size={18} /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full rounded-3xl bg-slate-100 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-3xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-700">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block rounded-3xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
