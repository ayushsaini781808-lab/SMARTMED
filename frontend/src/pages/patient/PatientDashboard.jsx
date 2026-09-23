import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import SymptomChecker from './SymptomChecker';
import QueueWidget from './QueueWidget';
import PrescriptionVault from './PrescriptionVault';

const TABS = [
  { key: 'book', labelKey: 'nav_book' },
  { key: 'history', labelKey: null, label: 'History' },
  { key: 'vault', labelKey: 'nav_prescriptions' }
];

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('book');

  async function loadAppointments() {
    const { data } = await api.get('/appointments/mine');
    setAppointments(data);
  }

  useEffect(() => { loadAppointments(); }, []);

  const activeAppt = appointments.find(a => ['booked', 'waiting', 'consulting'].includes(a.status));

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
            Hi, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Manage your appointments and health records</p>
        </div>

        {/* Active appointment queue widget */}
        {activeAppt && (
          <div className="mb-7">
            <QueueWidget appointment={activeAppt} onChange={loadAppointments} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-ink-200 dark:border-ink-700">
          {TABS.map(({ key, labelKey, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
                }`}
            >
              {labelKey ? t(labelKey) : label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {tab === 'book' && <SymptomChecker onBooked={loadAppointments} />}

        {tab === 'history' && (
          <div className="space-y-2">
            {appointments.length === 0 && (
              <Card className="p-8 text-center text-sm text-ink-400 dark:text-ink-500">No appointments yet.</Card>
            )}
            {appointments.map(a => (
              <Card key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900 dark:text-ink-50 text-sm">
                    {a.doctor?.user?.name} · {a.doctor?.specialization}
                  </p>
                  <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                    {a.date} · Token #{a.tokenNumber}
                  </p>
                </div>
                <Badge tone={a.status === 'completed' ? 'teal' : a.status === 'cancelled' ? 'red' : 'amber'}>
                  {t(`status_${a.status}`) || a.status}
                </Badge>
              </Card>
            ))}
          </div>
        )}

        {tab === 'vault' && <PrescriptionVault />}
      </div>
    </div>
  );
}
