import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { API_BASE } from '../../api/client';
import { Card, Badge } from '../../components/ui';
import { FileText } from 'lucide-react';

export default function PrescriptionVault() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => { api.get('/prescriptions/mine').then(({ data }) => setItems(data)); }, []);

  if (items.length === 0) {
    return <Card className="p-10 text-center text-sm text-ink-400">{t('no_prescriptions')}</Card>;
  }

  return (
    <div className="space-y-4">
      {items.map(p => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-teal-600" />
              <p className="text-sm font-semibold text-ink-900">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
            {p.imagePath && (
              <a
                href={`${API_BASE.replace(/\/api$/, '')}/${p.imagePath.replace(/^.*uploads/, 'uploads')}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-teal-700 font-semibold"
              >
                View scan
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {p.medicines.length === 0 && <p className="text-xs text-ink-400">No medicines extracted.</p>}
            {p.medicines.map((m, i) => (
              <Badge key={i} tone="teal">{m.name}{m.dosage ? ` · ${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}</Badge>
            ))}
          </div>
          {p.notes && <p className="text-sm text-ink-400 mt-3">{p.notes}</p>}
        </Card>
      ))}
    </div>
  );
}
