import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { useQueueSocket } from '../../hooks';
import { Radio } from 'lucide-react';

export default function QueueWidget({ appointment, onChange }) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(null);

  const refresh = useCallback(() => {
    api.get(`/appointments/queue-position/${appointment.id}`).then(({ data }) => setPosition(data)).catch(() => { });
  }, [appointment.id]);

  useEffect(() => { refresh(); }, [refresh]);
  useQueueSocket(appointment.doctorId, appointment.date, refresh);

  async function handleCancel() {
    if (!confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${appointment.id}/cancel`);
    onChange?.();
  }

  if (!position) return null;

  const isNext = position.patientsAhead === 0 && position.status !== 'consulting';
  const isConsulting = position.status === 'consulting';

  return (
    <Card className={`p-5 border-l-4 ${isConsulting
        ? 'border-l-teal-500 dark:border-l-teal-400'
        : isNext
          ? 'border-l-amber-500 dark:border-l-amber-400'
          : 'border-l-ink-200 dark:border-l-ink-600'
      }`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Radio size={11} className="text-teal-500 animate-pulse" /> {t('your_token')}
            </p>
            <p className="font-display text-3xl font-bold text-teal-600 dark:text-teal-400">#{position.tokenNumber}</p>
          </div>
          <div className="w-px h-10 bg-ink-100 dark:bg-ink-700" />
          <div>
            <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wide mb-1">{t('patients_ahead')}</p>
            <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{position.patientsAhead}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wide mb-1">{t('estimated_wait')}</p>
            <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
              {Math.round(position.estimatedWaitMinutes)} {t('minutes')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConsulting && <Badge tone="teal">{t('status_consulting')}</Badge>}
          {isNext && !isConsulting && <Badge tone="amber">{t('you_are_next')}</Badge>}
          {!isConsulting && (
            <Button variant="danger" onClick={handleCancel}>{t('cancel_appointment')}</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
