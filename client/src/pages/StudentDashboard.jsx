import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, FileText, HeartPulse, Layers } from 'lucide-react';
import Loader from '../components/Loader';
import ResumeScore from '../components/ResumeScore';
import { getStudentApplications } from '../services/applicationService';
import { updateProfile, uploadResume, fetchResumeInsights } from '../services/authService';

function StudentDashboard({ user, showToast, setUser }) {
  const [profile, setProfile] = useState(user);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', skills: user?.skills?.join(', ') || '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [resumeScoreData, setResumeScoreData] = useState({ suggestions: [] });

  useEffect(() => {
    setProfile(user);
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      skills: user?.skills?.join(', ') || '',
    });
  }, [user]);

  const loadAiInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data } = await fetchResumeInsights();
      setAiInsights(data.insights || null);
      setRecommendedJobs(data.insights?.recommendedJobs?.map((item) => item.job) || []);

      if (data.user) {
        setProfile(data.user);
        if (setUser && JSON.stringify(data.user) !== JSON.stringify(user)) {
          setUser(data.user);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const { data } = await getStudentApplications();
        setApplications(Array.isArray(data) ? data : data?.applications || []);
      } catch (error) {
        showToast(error.response?.data?.message || 'Unable to fetch applications', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      setLoading(false);
      return;
    }

    loadApplications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadAiInsights();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsList = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      const profileResponse = await updateProfile({ ...form, skills: skillsList });
      let updatedUser = profileResponse.data;
      if (setUser) setUser(updatedUser);

      if (resumeFile) {
        setUploadingResume(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const resumeResponse = await uploadResume(formData);
        updatedUser = resumeResponse.data.user;
        if (setUser) setUser(updatedUser);
        setResumeScoreData({
          score: resumeResponse.data.resumeScore,
          suggestions: resumeResponse.data.scoreData?.suggestions || [],
        });
        setAiInsights(resumeResponse.data.insights || null);
        setRecommendedJobs(resumeResponse.data.insights?.recommendedJobs?.map((item) => item.job) || []);
        showToast('Resume uploaded and analyzed successfully');
        setUploadingResume(false);
      } else {
        await loadAiInsights();
        updatedUser = JSON.parse(localStorage.getItem('user')) || updatedUser;
      }

      setProfile(updatedUser);
      if (setUser) setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setResumeFile(null);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
      setUploadingResume(false);
    } finally {
      setSaving(false);
    }
  };

  const resumeMatchScore = profile?.skills?.length ? Math.min(100, Math.round(profile.skills.length * 12 + 20)) : 0;

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 px-8 py-12 text-white shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Your dashboard helps you manage resumes, review application progress, and discover jobs that match your skills.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Resume score</p>
              <p className="mt-3 text-4xl font-semibold">{profile?.resumeScore || 0}%</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Applications</p>
              <p className="mt-3 text-4xl font-semibold">{applications.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-soft">
          <ResumeScore 
            score={profile?.resumeScore || 0} 
            suggestions={resumeScoreData.suggestions}
            isLoading={uploadingResume}
          />

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Resume preview</h2>
            <p className="mt-3 text-sm text-slate-500">Open your uploaded resume or upload the latest version.</p>
            {profile?.resumeUrl ? (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm text-white transition hover:bg-sky-500">View resume</a>
            ) : (
              <p className="mt-5 text-sm text-slate-500">No resume uploaded yet.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Quick stats</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                <span className="text-sm text-slate-500">Active applications</span>
                <span className="font-semibold text-slate-900">{applications.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                <span className="text-sm text-slate-500">Resume score</span>
                <span className="font-semibold text-slate-900">{profile?.resumeScore || 0}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {['Applied', 'Under review', 'Shortlisted', 'Accepted'].map((stage, index) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-sky-500" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Update profile</h2>
                <p className="text-sm text-slate-500">Keep your resume and skills up to date for stronger matches.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700">Key skills</label>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Figma, SQL" className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-slate-700 outline-none transition focus:border-sky-500" />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700">Upload resume (PDF)</label>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setResumeFile(e.target.files[0])} 
                  disabled={uploadingResume}
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60" 
                />
                {resumeFile && <p className="text-sm text-slate-500">Selected file: {resumeFile.name}</p>}
                {uploadingResume && <p className="text-sm text-sky-600 font-medium">Analyzing resume...</p>}
              </div>
              <button 
                type="submit" 
                disabled={saving || uploadingResume} 
                className="sm:col-span-2 rounded-full bg-sky-600 px-6 py-4 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving || uploadingResume ? 'Processing...' : 'Save profile'}
              </button>
            </form>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">AI Resume Insights</h2>
                <p className="text-sm text-slate-500">See which jobs match your resume, skills to strengthen, and AI-powered recommendations.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">{aiInsights ? `${aiInsights.matchPercentage}% Match` : 'Loading AI insights...'}</div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Resume strength</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">{aiInsights?.resumeStrength ?? profile?.resumeScore ?? 0}%</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{aiInsights ? (aiInsights.resumeStrength >= 75 ? 'Strong' : aiInsights.resumeStrength >= 45 ? 'Average' : 'Needs improvement') : '...'}</div>
                  </div>
                  <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div style={{ width: `${aiInsights?.resumeStrength ?? profile?.resumeScore ?? 0}%` }} className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"></div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-base font-semibold text-slate-900">Strong skills</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {aiInsights?.strongSkills?.length ? aiInsights.strongSkills.map((skill) => (
                        <span key={skill} className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-200">{skill}</span>
                      )) : (
                        <span className="text-sm text-slate-500">Upload a resume to detect your strongest skills.</span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-base font-semibold text-slate-900">Skills to improve</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {aiInsights?.missingSkills?.length ? aiInsights.missingSkills.map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">{skill}</span>
                      )) : (
                        <span className="text-sm text-slate-500">Your resume already matches well or you need to upload one.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-base font-semibold text-slate-900">Top recommended jobs</h3>
                <div className="mt-5 space-y-4">
                  {insightsLoading ? (
                    <div className="rounded-3xl bg-white p-6 text-center text-slate-500">Loading recommended jobs...</div>
                  ) : aiInsights?.recommendedJobs?.length ? (
                    aiInsights.recommendedJobs.map((item) => (
                      <div key={item.job._id} className="rounded-3xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{item.job.companyId?.name || 'Company'}</p>
                            <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.job.title}</h4>
                          </div>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{item.matchPercentage}%</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          {item.strongSkills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-100 px-2 py-1">{skill}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-white p-6 text-center text-slate-500">Update your resume and skills to generate AI recommendations.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Applications timeline</h2>
                <p className="text-sm text-slate-500">Track status updates from recruiters.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Most recent first</div>
            </div>
            {loading ? (
              <Loader />
            ) : applications.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No applications yet. Start exploring roles from jobs page.</div>
            ) : (
              <div className="mt-8 space-y-4">
                {applications.map((application) => (
                  <motion.div key={application._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{application.jobId?.title}</p>
                        <h3 className="text-lg font-semibold text-slate-900">{application.jobId?.title || 'Role'}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : application.status === 'rejected' ? 'bg-rose-100 text-rose-700' : application.status === 'shortlisted' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{application.status.replace('_', ' ')}</span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="mt-2 text-slate-900">{application.companyId ? application.companyId.name : 'Unknown'}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Resume</p>
                        <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-sky-600">View resume</a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="flex items-center gap-3 text-slate-900">
              <Code2 size={22} />
              <h2 className="text-2xl font-semibold">Recommended jobs</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">Based on your skills and uploaded resume.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recommendedJobs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Update your skills to see tailored recommendations.</div>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job._id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{job.title}</p>
                        <p className="mt-2 text-sm text-slate-500">{job.companyId?.name || 'Company'} • {job.location}</p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{job.jobType}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {job.skills?.slice(0, 3).map((skill) => (<span key={skill} className="rounded-full bg-slate-100 px-3 py-1">{skill}</span>))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
