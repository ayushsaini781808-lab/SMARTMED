import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Label } from '../components/ui';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, role: 'patient' });
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="p-7">
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{t('register_button')}</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-6">Sign up as a patient to start booking appointments.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('full_name')}</Label>
              <Input
                id="register-name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <Label>{t('email')}</Label>
              <Input
                id="register-email"
                type="text"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label>{t('phone')}</Label>
              <Input
                id="register-phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label>{t('password')}</Label>
              <Input
                id="register-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Choose a password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" id="register-submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : t('register_button')}
            </Button>
          </form>

          <p className="text-sm text-ink-500 dark:text-ink-400 mt-5 text-center">
            {t('have_account')}{' '}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">{t('nav_login')}</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
