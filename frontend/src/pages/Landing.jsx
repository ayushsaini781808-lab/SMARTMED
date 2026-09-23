import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Clock3, ScanLine, ShieldCheck, ArrowRight, Radio } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import api from '../api/client';

// Generate a consistent colour for a doctor's initials avatar
const AVATAR_PALETTES = [
  { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-teal-100 dark:bg-teal-950', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' },
];

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getPalette(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export default function Landing() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/doctors').then(({ data }) => setDoctors(data)).catch(() => { });
  }, []);

  const features = [
    {
      icon: Stethoscope,
      title: 'AI Symptom Triage',
      desc: 'Describe your symptoms in plain language. Our AI matches you to the right specialist before you book — no guessing required.',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950'
    },
    {
      icon: Clock3,
      title: 'Live Token Queue',
      desc: 'Watch your position update in real time via WebSocket. Know exactly when to arrive at the clinic.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950'
    },
    {
      icon: ScanLine,
      title: 'Digital Prescriptions',
      desc: 'Doctors upload handwritten prescriptions. Our OCR engine extracts medicines and stores them in your secure vault.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      desc: 'Your health records are encrypted and accessible only to you and your treating doctors.',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Patients served' },
    { value: '15+', label: 'Specialists' },
    { value: '98%', label: 'AI accuracy' },
    { value: '< 15 min', label: 'Avg. wait time' }
  ];

  return (
    <div className="bg-white dark:bg-ink-900">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="border-b border-ink-100 dark:border-ink-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 border border-teal-100 dark:border-teal-900 rounded px-2.5 py-1 mb-5">
              <Radio size={11} className="animate-pulse" />
              OPD Queue · AI Triage · E-Prescriptions
            </div>
            <h1 className="font-display text-4xl sm:text-[2.75rem] font-bold text-ink-900 dark:text-ink-50 leading-tight">
              {t('hero_title')}
            </h1>
            <p className="text-ink-500 dark:text-ink-400 text-base mt-4 leading-relaxed max-w-md">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register">
                <Button className="gap-2">
                  {t('get_started')} <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">{t('nav_login')}</Button>
              </Link>
            </div>
          </div>

          {/* Right — live token preview */}
          <div className="relative">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-ink-100 dark:border-ink-700">
                <div>
                  <p className="text-xs font-semibold text-ink-400 dark:text-ink-500 uppercase tracking-wide">Live token board</p>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 mt-0.5">Dr. Anjali Sharma · Neurology</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 border border-teal-100 dark:border-teal-900 px-2 py-0.5 rounded">
                  <Radio size={10} className="animate-pulse" /> Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-ink-50 dark:bg-ink-900 rounded-lg p-4 text-center">
                  <p className="text-xs text-ink-400 dark:text-ink-500 font-medium mb-1">Now consulting</p>
                  <p className="font-display text-3xl font-bold text-teal-600 dark:text-teal-400">#04</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 text-center border border-amber-100 dark:border-amber-900">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Your token</p>
                  <p className="font-display text-3xl font-bold text-amber-600 dark:text-amber-400">#07</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-ink-400 dark:text-ink-500 mb-1.5">
                  <span>Queue progress</span>
                  <span>3 ahead of you</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '57%' }} />
                </div>
              </div>
              <p className="text-xs text-ink-400 dark:text-ink-500">Estimated wait: ~24 minutes</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section className="bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-ink-200 dark:divide-ink-700">
            {stats.map((s) => (
              <div key={s.label} className="px-6 first:pl-0 last:pr-0 text-center">
                <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{s.value}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">How SmartMed works</h2>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-2 max-w-lg">
            From symptom to consultation — managed entirely online.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Card key={f.title} className="p-5 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-ink-200 dark:text-ink-700 font-display">
                0{i + 1}
              </div>
              <div className={`w-9 h-9 rounded-md ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={17} />
              </div>
              <h3 className="font-semibold text-ink-900 dark:text-ink-50 text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Specialists ───────────────────────────────────────────── */}
      {doctors.length > 0 && (
        <section className="border-t border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Our specialists</h2>
                <p className="text-ink-500 dark:text-ink-400 text-sm mt-2">
                  {doctors.length} doctors across {[...new Set(doctors.map(d => d.department))].length} departments
                </p>
              </div>
              <Link to="/register">
                <Button variant="secondary" className="gap-1.5">
                  Book an appointment <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {doctors.map(doc => {
                const initials = getInitials(doc.user.name);
                const palette = getPalette(doc.user.name);
                return (
                  <Card key={doc.id} className="p-4 flex flex-col">
                    <div className={`w-12 h-12 rounded-lg ${palette.bg} ${palette.text} font-display font-bold text-base flex items-center justify-center mb-3 flex-shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink-900 dark:text-ink-50 text-sm leading-snug">{doc.user.name}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{doc.specialization}</p>
                      <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">{doc.department}</p>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-3 line-clamp-2 leading-relaxed border-t border-ink-100 dark:border-ink-700 pt-3">
                      {doc.bio}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA banner ────────────────────────────────────────────── */}
      <section className="border-t border-ink-100 dark:border-ink-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50 mb-3">
            Ready to skip the waiting room?
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-7 max-w-sm mx-auto">
            Create a free account and book your first appointment in under two minutes.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/register"><Button className="gap-1.5">Get started free <ArrowRight size={14} /></Button></Link>
            <Link to="/login"><Button variant="secondary">Sign in</Button></Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ink-400 dark:text-ink-500">© 2025 SmartMed. All rights reserved.</p>
          <p className="text-xs text-ink-400 dark:text-ink-500">Built for patients · Trusted by doctors · Made in India</p>
        </div>
      </footer>
    </div>
  );
}
