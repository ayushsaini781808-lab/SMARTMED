import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { Card, Button, Badge } from '../../components/ui';
import { Sparkles, CalendarDays } from 'lucide-react';
import BookingFlow from './BookingFlow';

const BODY_PARTS = ['Head', 'Chest', 'Stomach', 'Back', 'Skin', 'Eyes', 'Ear/Nose/Throat', 'Joints'];

export default function SymptomChecker({ onBooked }) {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [bodyParts, setBodyParts] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);

  function toggleBodyPart(part) {
    setBodyParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  }

  async function handleCheck(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/appointments/symptom-check', { symptoms, bodyParts });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  if (bookingDoctor) {
    return (
      <BookingFlow
        doctor={bookingDoctor}
        symptomSummary={symptoms}
        suggestedSpecialist={result?.specialist}
        onBack={() => setBookingDoctor(null)}
        onBooked={() => { setBookingDoctor(null); setResult(null); setSymptoms(''); setBodyParts([]); onBooked?.(); }}
      />
    );
  }

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <Card className="p-6 md:col-span-2">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <Sparkles size={20} />
        </div>
        <h2 className="font-display font-bold text-lg text-ink-900">{t('symptom_title')}</h2>
        <p className="text-sm text-ink-400 mt-1 mb-4">{t('symptom_subtitle')}</p>

        <form onSubmit={handleCheck} className="space-y-4">
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder={t('symptom_placeholder')}
            rows={3}
            className="w-full rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none resize-none"
          />
          <div>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Affected area (optional)</p>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(part => (
                <button
                  type="button"
                  key={part}
                  onClick={() => toggleBodyPart(part)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    bodyParts.includes(part)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-ink-700 border-ink-100 hover:border-teal-300'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Checking…' : t('check_symptoms')}
          </Button>
        </form>
      </Card>

      <div className="md:col-span-3 space-y-4">
        {!result && (
          <Card className="p-10 flex flex-col items-center justify-center text-center h-full">
            <CalendarDays size={32} className="text-ink-100 mb-3" />
            <p className="text-sm text-ink-400 max-w-xs">
              Describe your symptoms on the left to get a specialist suggestion and available doctors.
            </p>
          </Card>
        )}

        {result && (
          <>
            <Card className="p-5 bg-teal-50/50 border-teal-100">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">{t('suggested_specialist')}</p>
              <p className="font-display text-xl font-bold text-ink-900">{result.specialist}</p>
              <p className="text-sm text-ink-400 mt-1">{result.reason}</p>
              <Badge tone="amber">{Math.round(result.confidence * 100)}% match confidence</Badge>
            </Card>

            <div className="space-y-3">
              {result.matchingDoctors.length === 0 && (
                <Card className="p-5 text-sm text-ink-400">No {result.specialist}s are currently available.</Card>
              )}
              {result.matchingDoctors.map(doc => (
                <Card key={doc.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{doc.user.name}</p>
                    <p className="text-xs text-ink-400">{doc.department}</p>
                  </div>
                  <Button variant="secondary" onClick={() => setBookingDoctor(doc)}>{t('book_now')}</Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
