import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { deleteJob } from '../services/jobService';

function AdminDashboard({ showToast }) {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersResponse, jobsResponse] = await Promise.all([api.get('/users'), api.get('/jobs')]);
      setUsers(usersResponse.data);
      setJobs(jobsResponse.data.jobs);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      showToast('User deleted');
      loadAdminData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      showToast('Job deleted');
      loadAdminData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Admin control panel</h2>
            <p className="mt-2 text-sm text-slate-500">Monitor users and review all job postings.</p>
          </div>
          <button onClick={loadAdminData} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Refresh</button>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[32px] bg-white p-6 shadow-soft sm:p-8">
            <h3 className="text-xl font-semibold text-slate-900">All users</h3>
            <div className="mt-6 space-y-4">
              {users.map((user) => (
                <div key={user._id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-sm text-slate-500">Role: {user.role}</p>
                  </div>
                  <button onClick={() => handleDeleteUser(user._id)} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100">Delete</button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-soft sm:p-8">
            <h3 className="text-xl font-semibold text-slate-900">All job postings</h3>
            <div className="mt-6 space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.location} • {job.salary}</p>
                    <p className="text-sm text-slate-500">Posted by: {job.companyId?.name || 'Company'}</p>
                  </div>
                  <button onClick={() => handleDeleteJob(job._id)} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100">Delete</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
