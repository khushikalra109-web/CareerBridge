import { Link } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/' },
];

function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold text-slate-900">CareerBridge</Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="transition hover:text-slate-900">{item.label}</Link>
          ))}
          {!user ? (
            <>
              <Link to="/login" className="rounded-full bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700">Login</Link>
              <Link to="/signup" className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100">Sign up</Link>
            </>
          ) : (
            <>
              {user.role === 'student' && <Link to="/student" className="text-slate-700">Dashboard</Link>}
              {user.role === 'company' && <Link to="/company" className="text-slate-700">Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin" className="text-slate-700">Admin</Link>}
              <button onClick={onLogout} className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
