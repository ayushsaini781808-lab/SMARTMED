import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import SymptomChecker from './SymptomChecker';
import QueueWidget from './QueueWidget';
import PrescriptionVault from './PrescriptionVault';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Hi, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-ink-400 mt-1">Manage your appointments and health records</p>
        </div>
      </div>

      {activeAppt && (
        <div className="mb-8">
          <QueueWidget appointment={activeAppt} onChange={loadAppointments} />
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-ink-100">
        {[
          ['book', t('nav_book')],
          ['history', 'History'],
          ['vault', t('nav_prescriptions')]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              tab === key ? 'border-teal-600 text-teal-700' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'book' && <SymptomChecker onBooked={loadAppointments} />}

      {tab === 'history' && (
        <div className="space-y-3">
          {appointments.length === 0 && <Card className="p-6 text-sm text-ink-400">No appointments yet.</Card>}
          {appointments.map(a => (
            <Card key={a.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink-900">{a.doctor?.user?.name} · {a.doctor?.specialization}</p>
                <p className="text-xs text-ink-400 mt-0.5">{a.date} · Token #{a.tokenNumber}</p>
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
  );
}
