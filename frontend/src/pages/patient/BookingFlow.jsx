import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { ChevronLeft } from 'lucide-react';

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
    alert('Added to waitlist — you\u2019ll be notified if a spot opens up.');
  }

  if (confirmed) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Badge tone="teal">{t('booking_confirmed')}</Badge>
        <p className="font-display text-5xl font-extrabold text-teal-700 mt-4">#{confirmed.tokenNumber}</p>
        <p className="text-sm text-ink-400 mt-2">{t('your_token')} · {doctor.user.name} · {confirmed.date}</p>
        <Button className="mt-6" onClick={onBooked}>Done</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700 mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="font-display font-bold text-lg text-ink-900">{doctor.user.name}</h2>
      <p className="text-sm text-ink-400 mb-5">{doctor.specialization} · {doctor.department}</p>

      <div className="mb-5">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">{t('select_date')}</p>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={e => setDate(e.target.value)}
          className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:border-teal-400 outline-none"
        />
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">{t('select_slot')}</p>
        {slots.length === 0 && <p className="text-sm text-ink-400">No slots configured for this date.</p>}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {slots.map(slot => {
            const full = slot.status !== 'open';
            const active = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                disabled={full}
                onClick={() => setSelectedSlot(slot)}
                className={`text-xs font-semibold py-2 rounded-lg border transition ${
                  full ? 'bg-ink-50 text-ink-100 border-ink-50 cursor-not-allowed line-through'
                  : active ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-ink-700 border-ink-100 hover:border-teal-300'
                }`}
              >
                {slot.startTime}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

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
