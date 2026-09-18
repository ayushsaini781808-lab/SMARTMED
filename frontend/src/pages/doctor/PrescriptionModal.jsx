import { useState } from 'react';
import api from '../../api/client';
import { Button } from '../../components/ui';
import { X, Upload } from 'lucide-react';

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
    <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl2 max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-ink-900">Upload prescription</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-900"><X size={18} /></button>
        </div>
        <p className="text-xs text-ink-400 mb-4">For {appointment.patient?.name} · Token #{appointment.tokenNumber}</p>

        {!result ? (
          <>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-100 rounded-xl p-6 cursor-pointer hover:border-teal-300 transition mb-4">
              <Upload size={22} className="text-ink-400" />
              <span className="text-xs text-ink-400">{file ? file.name : 'Click to select a prescription image (PNG/JPG)'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={2}
              className="w-full rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm outline-none mb-4 resize-none"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button disabled={!file || loading} onClick={handleUpload} className="w-full">
              {loading ? 'Extracting text…' : 'Upload & extract'}
            </Button>
          </>
        ) : (
          <div>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Extracted medicines</p>
            {result.medicines.length === 0 && <p className="text-sm text-ink-400 mb-4">No structured medicines detected — raw text was still saved to the patient's vault.</p>}
            <div className="flex flex-wrap gap-2 mb-5">
              {result.medicines.map((m, i) => (
                <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
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
