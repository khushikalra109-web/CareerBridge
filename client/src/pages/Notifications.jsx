import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { fetchNotifications } from '../services/notificationService';
import Loader from '../components/Loader';

function Notifications({ user, showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await fetchNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        showToast(error.response?.data?.message || 'Unable to load notifications', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [user, showToast]);

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <div className="rounded-3xl bg-sky-100 p-3 text-sky-700">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">All of your platform updates and alerts in one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6"><Loader /></div>
      ) : notifications.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No notifications yet. Everything is calm right now.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="text-sm text-slate-600">{notification.message}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{notification.read ? 'Read' : 'Unread'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
