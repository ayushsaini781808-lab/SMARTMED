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
    <div className="max-w-md mx-auto px-4 py-16">
      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('register_button')}</h1>
        <p className="text-sm text-ink-400 mt-1 mb-6">Sign up as a patient to start booking appointments.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('full_name')}</Label>
            <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
          </div>
          <div>
            <Label>{t('email')}</Label>
            <Input type="text" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <Label>{t('phone')}</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div>
            <Label>{t('password')}</Label>
            <Input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Any password" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? '…' : t('register_button')}</Button>
        </form>

        <p className="text-sm text-ink-400 mt-6 text-center">
          {t('have_account')} <Link to="/login" className="text-teal-700 font-semibold">{t('nav_login')}</Link>
        </p>
      </Card>
    </div>
  );
}
