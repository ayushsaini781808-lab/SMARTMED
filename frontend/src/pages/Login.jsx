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
    <div className="max-w-md mx-auto px-4 py-16">
      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('login_title')}</h1>
        <p className="text-sm text-ink-400 mt-1 mb-6">{t('login_subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('email')}</Label>
            <Input type="text" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ID or Email" />
          </div>
          <div>
            <Label>{t('password')}</Label>
            <Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? '…' : t('login_button')}</Button>
        </form>

        <p className="text-sm text-ink-400 mt-6 text-center">
          {t('no_account')} <Link to="/register" className="text-teal-700 font-semibold">{t('nav_register')}</Link>
        </p>

        <div className="mt-6 pt-6 border-t border-ink-100 text-xs text-ink-400">
          <p className="font-semibold mb-1">Demo accounts (password: Password123!)</p>
          <p>Patient: patient@smartmed.app</p>
          <p>Doctor: anjali.sharma@smartmed.app</p>
          <p>Admin: admin@smartmed.app</p>
        </div>
      </Card>
    </div>
  );
}
