import { useState } from 'react';
import api from '../../api/client';
import { Button } from '../../components/ui';
import { X, Upload, CheckCircle2 } from 'lucide-react';

export default function PrescriptionModal({ appointment, doctorId, onClose }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('appointmentId', appointment.id);
      form.append('patientId', appointment.patientId);
      form.append('doctorId', doctorId);
      form.append('notes', notes);
      const { data } = await api.post('/prescriptions/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try a clearer image.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink-900/50 dark:bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl max-w-md w-full p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">Upload prescription</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-400 dark:text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-500 mb-5">
          For {appointment.patient?.name} · Token #{appointment.tokenNumber}
        </p>

        {!result ? (
          <>
            {/* File drop zone */}
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-200 dark:border-ink-600 rounded-lg p-6 cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 transition-colors mb-4">
              <Upload size={20} className="text-ink-400 dark:text-ink-500" />
              <span className="text-xs text-ink-500 dark:text-ink-400 text-center">
                {file ? file.name : 'Click to select a prescription image (PNG / JPG)'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>

            {/* Notes */}
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={2}
              className="w-full rounded-md border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 px-3 py-2 text-sm outline-none mb-4 resize-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <Button disabled={!file || loading} onClick={handleUpload} className="w-full">
              {loading ? 'Extracting text…' : 'Upload & extract'}
            </Button>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
              <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Extracted medicines</p>
            </div>
            {result.medicines.length === 0 && (
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
                No structured medicines detected — raw text was saved to the patient's vault.
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-5">
              {result.medicines.map((m, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2 py-0.5 rounded border bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-900"
                >
                  {m.name}{m.dosage ? ` · ${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
                </span>
              ))}
            </div>
            <Button onClick={onClose} className="w-full">Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}
