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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-8">Admin Panel</h1>

      <div className="flex gap-2 mb-6 border-b border-ink-100 overflow-x-auto">
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              tab === key ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && report && (
        <div>
          <div className="grid sm:grid-cols-5 gap-4 mb-8">
            {[
              ['Total bookings', report.totalBookings],
              ['In queue', report.inQueue],
              ['Consulting', report.consulting],
              ['Completed', report.completed],
              ['Cancelled', report.cancelled]
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">{label}</p>
                <p className="font-display text-3xl font-extrabold text-ink-900 mt-1">{value}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-900 mb-4">By department</h3>
            <div className="space-y-2">
              {Object.entries(report.byDepartment).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{dept}</span>
                  <Badge tone="teal">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-3">
          {doctors.map(doc => (
            <Card key={doc.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-ink-900">{doc.user.name}</p>
                <p className="text-xs text-ink-400">{doc.specialization} · {doc.department}</p>
              </div>
              <div className="flex items-center gap-3">
                {doc.onLeave && <Badge tone="red">{t('doctor_on_leave')}</Badge>}
                <Button variant={doc.onLeave ? 'secondary' : 'danger'} onClick={() => toggleLeave(doc.id, doc.onLeave)}>
                  {doc.onLeave ? 'Set active' : t('toggle_leave')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map(u => (
            <Card key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink-900">{u.name}</p>
                <p className="text-xs text-ink-400">{u.email}</p>
              </div>
              <Badge tone="teal">{u.role}</Badge>
            </Card>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-2">
          {logs.length === 0 && <Card className="p-6 text-sm text-ink-400">No notifications sent yet.</Card>}
          {logs.map((l, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Badge tone={l.channel === 'email' ? 'teal' : 'amber'}>{l.channel}</Badge>
                <span className="text-xs text-ink-400">{new Date(l.at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-ink-700">To: {l.to}</p>
              <p className="text-sm text-ink-400">{l.subject || l.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
