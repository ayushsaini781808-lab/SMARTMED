import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Label } from '../components/ui';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(form.email.trim(), form.password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white dark:bg-ink-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="p-7">
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{t('login_title')}</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-6">{t('login_subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('email')}</Label>
              <Input
                id="login-email"
                type="text"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="ID or Email"
              />
            </div>
            <div>
              <Label>{t('password')}</Label>
              <Input
                id="login-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" id="login-submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : t('login_button')}
            </Button>
          </form>

          <p className="text-sm text-ink-500 dark:text-ink-400 mt-5 text-center">
            {t('no_account')}{' '}
            <Link to="/register" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">{t('nav_register')}</Link>
          </p>

          <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-700 text-xs text-ink-400 dark:text-ink-500 space-y-0.5">
            <p className="font-semibold text-ink-500 dark:text-ink-400 mb-1">Demo accounts (password: Password123!)</p>
            <p>Patient: patient@smartmed.app</p>
            <p>Doctor: anjali.sharma@smartmed.app</p>
            <p>Admin: admin@smartmed.app</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
