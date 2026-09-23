import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function BookingFlow({ doctor, symptomSummary, suggestedSpecialist, onBack, onBooked }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${doctor.id}/slots`, { params: { date } }).then(({ data }) => {
      setSlots(data);
      setSelectedSlot(null);
    });
  }, [doctor.id, date]);

  async function handleBook() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/appointments/book', {
        slotId: selectedSlot.id, symptomSummary, suggestedSpecialist
      });
      setConfirmed(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleWaitlist() {
    if (!selectedSlot) return;
    await api.post('/appointments/waitlist', { slotId: selectedSlot.id });
    setError('');
    alert('Added to waitlist — you\'ll be notified if a spot opens up.');
  }

  // Confirmation screen
  if (confirmed) {
    return (
      <Card className="p-8 max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="font-display font-bold text-ink-900 dark:text-ink-50 text-lg">{t('booking_confirmed')}</h2>
        <p className="text-3xl font-display font-bold text-teal-600 dark:text-teal-400 mt-3">#{confirmed.tokenNumber}</p>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">{t('your_token')} · {doctor.user.name} · {confirmed.date}</p>
        <Button className="mt-6 w-full" onClick={onBooked}>Done</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 transition-colors mb-5"
      >
        <ChevronLeft size={15} /> Back
      </button>

      <div className="mb-5">
        <h2 className="font-display font-bold text-ink-900 dark:text-ink-50">{doctor.user.name}</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400">{doctor.specialization} · {doctor.department}</p>
      </div>

      {/* Date picker */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-2">
          {t('select_date')}
        </label>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={e => setDate(e.target.value)}
          className="rounded-md border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
        />
      </div>

      {/* Slot grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-2">{t('select_slot')}</p>
        {slots.length === 0 && (
          <p className="text-sm text-ink-400 dark:text-ink-500">No slots configured for this date.</p>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {slots.map(slot => {
            const full = slot.status !== 'open';
            const active = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                disabled={full}
                onClick={() => setSelectedSlot(slot)}
                className={`text-xs font-medium py-2 rounded-md border transition-colors ${full
                    ? 'bg-ink-50 dark:bg-ink-800 text-ink-300 dark:text-ink-600 border-ink-100 dark:border-ink-700 cursor-not-allowed line-through'
                    : active
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-600 hover:border-teal-400'
                  }`}
              >
                {slot.startTime}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button disabled={!selectedSlot || loading} onClick={handleBook}>
          {loading ? '…' : t('confirm_booking')}
        </Button>
        {selectedSlot?.status === 'full' && (
          <Button variant="secondary" onClick={handleWaitlist}>Join waitlist</Button>
        )}
      </div>
    </Card>
  );
}
