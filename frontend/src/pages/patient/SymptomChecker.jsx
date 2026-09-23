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
    <div className="grid md:grid-cols-5 gap-5">
      {/* Input panel */}
      <Card className="p-5 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base text-ink-900 dark:text-ink-50">{t('symptom_title')}</h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">{t('symptom_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <textarea
            id="symptom-input"
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder={t('symptom_placeholder')}
            rows={4}
            className="w-full rounded-md border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none transition-colors"
          />
          <div>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-2">
              Affected area (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(part => (
                <button
                  type="button"
                  key={part}
                  onClick={() => toggleBodyPart(part)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${bodyParts.includes(part)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-600 hover:border-teal-400'
                    }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
          <Button id="check-symptoms-btn" type="submit" disabled={loading} className="w-full">
            {loading ? 'Checking…' : t('check_symptoms')}
          </Button>
        </form>
      </Card>

      {/* Results panel */}
      <div className="md:col-span-3 space-y-3">
        {!result && (
          <Card className="p-10 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <CalendarDays size={28} className="text-ink-200 dark:text-ink-600 mb-3" />
            <p className="text-sm text-ink-400 dark:text-ink-500 max-w-xs">
              Describe your symptoms on the left to get a specialist suggestion and available doctors.
            </p>
          </Card>
        )}

        {result && (
          <>
            <Card className="p-5 border-l-4 border-l-teal-500">
              <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1">
                {t('suggested_specialist')}
              </p>
              <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{result.specialist}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-3">{result.reason}</p>
              <Badge tone="amber">{Math.round(result.confidence * 100)}% match confidence</Badge>
            </Card>

            <div className="space-y-2">
              {result.matchingDoctors.length === 0 && (
                <Card className="p-5 text-sm text-ink-400 dark:text-ink-500">
                  No {result.specialist}s are currently available.
                </Card>
              )}
              {result.matchingDoctors.map(doc => (
                <Card key={doc.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-ink-50 text-sm">{doc.user.name}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{doc.department}</p>
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
