import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Clock3, ScanLine, User } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import api from '../api/client';

export default function Landing() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/doctors').then(({ data }) => setDoctors(data.slice(0, 4))).catch(() => { });
  }, []);

  const features = [
    { icon: Stethoscope, title: 'AI Symptom Triage', desc: 'Describe how you feel — get matched to the right specialist before you book.' },
    { icon: Clock3, title: 'Live Token Queue', desc: 'See your token move in real time. No more guessing when to arrive.' },
    { icon: ScanLine, title: 'Digital Prescriptions', desc: 'Handwritten scripts, scanned and stored in your medical vault automatically.' }
  ];

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Badge tone="amber">OPD Queue • AI Triage • E-Prescriptions</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 mt-5 leading-tight">
            {t('hero_title')}
          </h1>
          <p className="text-ink-400 text-lg mt-4 max-w-md">{t('hero_subtitle')}</p>
          <div className="flex gap-3 mt-8">
            <Link to="/register"><Button>{t('get_started')}</Button></Link>
            <Link to="/login"><Button variant="secondary">{t('nav_login')}</Button></Link>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Live token board</span>
            <Badge tone="teal">Dr. Anjali Sharma · Neurology</Badge>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-xs text-ink-400 font-semibold">Now consulting</div>
              <div className="text-5xl font-display font-extrabold text-teal-700">#04</div>
            </div>
            <div className="pb-2">
              <div className="text-xs text-ink-400 font-semibold">You are</div>
              <div className="text-2xl font-display font-bold text-amber-600">#07 · next in 3</div>
            </div>
          </div>
          <div className="mt-6 h-2 rounded-full bg-ink-50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-amber-400 w-2/3 rounded-full" />
          </div>
          <p className="text-xs text-ink-400 mt-3">Estimated wait: ~24 minutes · updates live via WebSocket</p>
        </Card>
      </section>

      {/* Attractive Statistics Banner */}
      <section className="bg-teal-700 text-teal-50 py-12 mb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-teal-600/50">
            <div>
              <div className="text-4xl font-display font-bold text-white mb-1">10,000+</div>
              <div className="text-sm font-medium text-teal-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-white mb-1">50+</div>
              <div className="text-sm font-medium text-teal-100">Top Specialists</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-white mb-1">98%</div>
              <div className="text-sm font-medium text-teal-100">AI Diagnostic Match</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-white mb-1">15 mins</div>
              <div className="text-sm font-medium text-teal-100">Average Wait Time</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-ink-900">{f.title}</h3>
              <p className="text-sm text-ink-400 mt-2">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* New attractive section for displaying experts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-ink-900">Meet Our Top Specialists</h2>
          <p className="text-ink-400 mt-3 max-w-xl mx-auto">Book appointments with top-rated medical experts directly through our platform.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {doctors.map(doc => (
            <Card key={doc.id} className="p-5 flex flex-col items-center text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4">
                <User size={32} />
              </div>
              <h3 className="font-bold text-ink-900 mb-1">{doc.user.name}</h3>
              <p className="text-xs text-teal-700 font-semibold mb-2">{doc.specialization}</p>
              <p className="text-xs text-ink-400 line-clamp-2">{doc.bio || 'World class specialist dedicated to providing complete care.'}</p>
            </Card>
          ))}
        </div>

        {doctors.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/register"><Button variant="secondary">View All Specialists</Button></Link>
          </div>
        )}
      </section>
    </div>
  );
}
