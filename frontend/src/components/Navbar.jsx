import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Activity, Globe, LogOut } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function toggleLang() {
    const next = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('smartmed_lang', next);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : '/patient';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-teal-700 text-lg">
          <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          {t('appName')}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-700 px-3 py-1.5 rounded-full border border-ink-100 hover:bg-ink-50 transition"
            aria-label="Toggle language"
          >
            <Globe size={15} /> {i18n.language === 'en' ? 'हिंदी' : 'EN'}
          </button>

          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-ink-700 hover:text-teal-700 transition hidden sm:block">
                {t('nav_dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-ink-900 px-4 py-2 rounded-full hover:bg-ink-700 transition"
              >
                <LogOut size={14} /> {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-teal-700 transition">
                {t('nav_login')}
              </Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-teal-600 px-4 py-2 rounded-full hover:bg-teal-700 transition">
                {t('nav_register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
