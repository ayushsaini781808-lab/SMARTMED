import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks';
import { Activity, Globe, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-ink-900 dark:text-ink-50 text-base">
          <span className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
            <Activity size={15} strokeWidth={2.5} />
          </span>
          SmartMed
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-500 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-medium text-ink-600 dark:text-ink-300 px-2.5 py-1.5 rounded-md border border-ink-100 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            aria-label="Toggle language"
          >
            <Globe size={13} /> {i18n.language === 'en' ? 'हिंदी' : 'EN'}
          </button>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-50 transition-colors hidden sm:block"
              >
                {t('nav_dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-ink-900 dark:bg-ink-50 dark:text-ink-900 px-3.5 py-1.5 rounded-md hover:bg-ink-700 dark:hover:bg-ink-200 transition-colors"
              >
                <LogOut size={13} /> {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
              >
                {t('nav_login')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-teal-600 px-3.5 py-1.5 rounded-md hover:bg-teal-700 transition-colors"
              >
                {t('nav_register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
