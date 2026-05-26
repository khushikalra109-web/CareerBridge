import { Github, Linkedin, Instagram } from 'lucide-react';

const footerLinks = [
  { title: 'Product', items: ['Jobs', 'Companies', 'Pricing', 'Resources'] },
  { title: 'Company', items: ['About', 'Careers', 'Contact', 'Support'] },
  { title: 'Legal', items: ['Privacy', 'Terms', 'Security'] },
];

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold text-white">CareerBridge</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">A premium campus hiring platform with analytics, resume matching, and advanced job discovery.</p>
          <div className="mt-6 flex items-center gap-4 text-slate-400">
            <a href="#" className="transition hover:text-white"><Github size={18} /></a>
            <a href="#" className="transition hover:text-white"><Linkedin size={18} /></a>
            <a href="#" className="transition hover:text-white"><Instagram size={18} /></a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-500">
                {group.items.map((item) => (
                  <li key={item} className="transition hover:text-white">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">© 2026 CareerBridge. Built for modern campus hiring.</div>
    </footer>
  );
}

export default Footer;
