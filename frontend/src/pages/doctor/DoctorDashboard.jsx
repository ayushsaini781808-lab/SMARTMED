import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useQueueSocket } from '../../hooks';
import { Play, CheckCircle2, FileUp, PowerOff, Users } from 'lucide-react';
import PrescriptionModal from './PrescriptionModal';

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { doctorProfile } = useAuth();
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

  if (!doctorProfile) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900 flex items-center justify-center">
        <p className="text-sm text-ink-400 dark:text-ink-500">Loading doctor profile…</p>
      </div>
    );
  }

  const statusTone = { booked: 'grey', waiting: 'amber', consulting: 'teal' };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{t('today_queue')}</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
              {doctorProfile.specialization} · {doctorProfile.department}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onLeave && <Badge tone="red">{t('doctor_on_leave')}</Badge>}
            <Button variant={onLeave ? 'secondary' : 'danger'} onClick={toggleLeave}>
              <PowerOff size={14} /> {onLeave ? 'Set active' : t('toggle_leave')}
            </Button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: 'Total', value: queue.length },
            { label: 'Waiting', value: queue.filter(q => q.status === 'waiting').length },
            { label: 'Consulting', value: queue.filter(q => q.status === 'consulting').length }
          ].map(({ label, value }) => (
            <Card key={label} className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-ink-900 dark:text-ink-50">{value}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Queue list */}
        {queue.length === 0 ? (
          <Card className="p-10 text-center">
            <Users size={28} className="text-ink-200 dark:text-ink-600 mx-auto mb-3" />
            <p className="text-sm text-ink-400 dark:text-ink-500">{t('no_patients_today')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {queue.map(item => (
              <Card key={item.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 font-display font-bold text-sm flex items-center justify-center flex-shrink-0">
                    #{item.tokenNumber}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900 dark:text-ink-50 text-sm">{item.patient?.name}</p>
                    {item.symptomSummary && (
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 max-w-xs line-clamp-1">{item.symptomSummary}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={statusTone[item.status] || 'grey'}>{t(`status_${item.status}`) || item.status}</Badge>
                  {item.status !== 'consulting' && (
                    <Button variant="secondary" onClick={() => handleStart(item.id)}>
                      <Play size={13} /> {t('start_consultation')}
                    </Button>
                  )}
                  {item.status === 'consulting' && (
                    <>
                      <Button variant="amber" onClick={() => setRxTarget(item)}>
                        <FileUp size={13} /> Prescribe
                      </Button>
                      <Button onClick={() => handleComplete(item.id)}>
                        <CheckCircle2 size={13} /> {t('mark_complete')}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {rxTarget && (
          <PrescriptionModal
            appointment={rxTarget}
            doctorId={doctorProfile.id}
            onClose={() => setRxTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
