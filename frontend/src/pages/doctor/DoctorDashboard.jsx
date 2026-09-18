import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useQueueSocket } from '../../hooks';
import { Play, CheckCircle2, FileUp, PowerOff } from 'lucide-react';
import PrescriptionModal from './PrescriptionModal';

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { doctorProfile, setUser } = useAuth();
  const [queue, setQueue] = useState([]);
  const [onLeave, setOnLeave] = useState(doctorProfile?.onLeave || false);
  const [rxTarget, setRxTarget] = useState(null);
  const date = todayISO();

  const refresh = useCallback(() => {
    if (!doctorProfile) return;
    api.get(`/appointments/queue/${doctorProfile.id}`, { params: { date } }).then(({ data }) => setQueue(data.queue));
  }, [doctorProfile, date]);

  useEffect(() => { refresh(); }, [refresh]);
  useQueueSocket(doctorProfile?.id, date, refresh);

  async function handleStart(id) {
    await api.patch(`/appointments/${id}/start`);
    refresh();
  }
  async function handleComplete(id) {
    await api.patch(`/appointments/${id}/complete`);
    refresh();
  }
  async function toggleLeave() {
    const next = !onLeave;
    await api.patch(`/doctors/${doctorProfile.id}/leave`, { onLeave: next, reason: 'Doctor marked unavailable' });
    setOnLeave(next);
  }

  if (!doctorProfile) return <div className="max-w-6xl mx-auto px-6 py-10 text-ink-400">Loading doctor profile…</div>;

  const statusTone = { booked: 'grey', waiting: 'amber', consulting: 'teal' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{t('today_queue')}</h1>
          <p className="text-sm text-ink-400 mt-1">{doctorProfile.specialization} · {doctorProfile.department}</p>
        </div>
        <Button variant={onLeave ? 'danger' : 'secondary'} onClick={toggleLeave}>
          <PowerOff size={15} /> {onLeave ? t('doctor_on_leave') : t('toggle_leave')}
        </Button>
      </div>

      {queue.length === 0 && (
        <Card className="p-10 text-center text-sm text-ink-400">{t('no_patients_today')}</Card>
      )}

      <div className="space-y-3">
        {queue.map(item => (
          <Card key={item.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 font-display font-bold flex items-center justify-center">
                #{item.tokenNumber}
              </div>
              <div>
                <p className="font-semibold text-ink-900">{item.patient?.name}</p>
                {item.symptomSummary && <p className="text-xs text-ink-400 mt-0.5 max-w-xs">{item.symptomSummary}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone={statusTone[item.status] || 'grey'}>{t(`status_${item.status}`) || item.status}</Badge>
              {item.status !== 'consulting' && (
                <Button variant="secondary" onClick={() => handleStart(item.id)}>
                  <Play size={14} /> {t('start_consultation')}
                </Button>
              )}
              {item.status === 'consulting' && (
                <>
                  <Button variant="amber" onClick={() => setRxTarget(item)}>
                    <FileUp size={14} /> Prescribe
                  </Button>
                  <Button onClick={() => handleComplete(item.id)}>
                    <CheckCircle2 size={14} /> {t('mark_complete')}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {rxTarget && (
        <PrescriptionModal
          appointment={rxTarget}
          doctorId={doctorProfile.id}
          onClose={() => setRxTarget(null)}
        />
      )}
    </div>
  );
}
