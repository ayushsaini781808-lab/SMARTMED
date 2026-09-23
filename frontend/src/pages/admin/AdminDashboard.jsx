import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Badge, Button } from '../../components/ui';
import { Users, Building2, BarChart3, Bell } from 'lucide-react';

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [report, setReport] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/reports/daily', { params: { date: todayISO() } }).then(({ data }) => setReport(data));
    api.get('/doctors').then(({ data }) => setDoctors(data));
  }, []);

  useEffect(() => {
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data));
    if (tab === 'notifications') api.get('/admin/notifications/log').then(({ data }) => setLogs(data));
  }, [tab]);

  async function toggleLeave(doctorId, current) {
    await api.patch(`/doctors/${doctorId}/leave`, { onLeave: !current, reason: 'Set by admin' });
    const { data } = await api.get('/doctors');
    setDoctors(data);
  }

  const tabs = [
    ['overview', t('admin_overview'), BarChart3],
    ['departments', t('admin_departments'), Building2],
    ['users', t('admin_users'), Users],
    ['notifications', t('admin_notifications'), Bell]
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">Admin Panel</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Platform overview and management</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 mb-6 border-b border-ink-200 dark:border-ink-700 overflow-x-auto">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === key
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
                }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && report && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                ['Total bookings', report.totalBookings, 'teal'],
                ['In queue', report.inQueue, null],
                ['Consulting', report.consulting, null],
                ['Completed', report.completed, null],
                ['Cancelled', report.cancelled, 'red']
              ].map(([label, value, accent]) => (
                <Card key={label} className={`p-4 ${accent === 'teal' ? 'border-l-4 border-l-teal-500' : accent === 'red' ? 'border-l-4 border-l-red-400' : ''}`}>
                  <p className="text-xs text-ink-500 dark:text-ink-400 font-medium mb-1">{label}</p>
                  <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{value}</p>
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <h3 className="font-semibold text-ink-900 dark:text-ink-50 text-sm mb-4">By department</h3>
              <div className="space-y-2">
                {Object.entries(report.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-sm py-1.5 border-b border-ink-50 dark:border-ink-700 last:border-0">
                    <span className="text-ink-600 dark:text-ink-300">{dept}</span>
                    <Badge tone="teal">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Departments tab */}
        {tab === 'departments' && (
          <div className="space-y-2">
            {doctors.map(doc => (
              <Card key={doc.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-ink-900 dark:text-ink-50 text-sm">{doc.user.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{doc.specialization} · {doc.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.onLeave && <Badge tone="red">{t('doctor_on_leave')}</Badge>}
                  <Button
                    variant={doc.onLeave ? 'secondary' : 'danger'}
                    onClick={() => toggleLeave(doc.id, doc.onLeave)}
                  >
                    {doc.onLeave ? 'Set active' : t('toggle_leave')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="space-y-2">
            {users.map(u => (
              <Card key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900 dark:text-ink-50 text-sm">{u.name}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">{u.email}</p>
                </div>
                <Badge tone={u.role === 'admin' ? 'red' : u.role === 'doctor' ? 'teal' : 'grey'}>{u.role}</Badge>
              </Card>
            ))}
          </div>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <div className="space-y-2">
            {logs.length === 0 && (
              <Card className="p-8 text-center text-sm text-ink-400 dark:text-ink-500">
                No notifications sent yet.
              </Card>
            )}
            {logs.map((l, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={l.channel === 'email' ? 'teal' : 'amber'}>{l.channel}</Badge>
                  <span className="text-xs text-ink-400 dark:text-ink-500">{new Date(l.at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-ink-700 dark:text-ink-200">To: {l.to}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{l.subject || l.text}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
