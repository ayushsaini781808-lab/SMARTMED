import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { API_BASE } from '../../api/client';
import { Card, Badge } from '../../components/ui';
import { FileText, ExternalLink } from 'lucide-react';

export default function PrescriptionVault() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => { api.get('/prescriptions/mine').then(({ data }) => setItems(data)); }, []);

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <FileText size={28} className="text-ink-200 dark:text-ink-600 mx-auto mb-3" />
        <p className="text-sm text-ink-400 dark:text-ink-500">{t('no_prescriptions')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(p => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <p className="text-sm font-medium text-ink-900 dark:text-ink-50">
                {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {p.imagePath && (
              <a
                href={`${API_BASE.replace(/\/api$/, '')}/${p.imagePath.replace(/^.*uploads/, 'uploads')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
              >
                View scan <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {p.medicines.length === 0 && (
              <p className="text-xs text-ink-400 dark:text-ink-500">No medicines extracted.</p>
            )}
            {p.medicines.map((m, i) => (
              <Badge key={i} tone="teal">
                {m.name}{m.dosage ? ` · ${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
              </Badge>
            ))}
          </div>
          {p.notes && (
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">{p.notes}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
