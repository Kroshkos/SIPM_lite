import { useState, useEffect, useCallback } from 'react';
import { useStore } from './store';
import { TaskStatus, ProjectStatus, GrantStatus } from './types';
import { Dashboard } from './modules/Dashboard';
import { TasksModule } from './modules/Tasks';
import { ProjectsModule } from './modules/Projects';
import { DocumentsModule } from './modules/Documents';
import { GrantsModule } from './modules/Grants';
import { Priority2030Module } from './modules/Priority2030';
import { ScholarshipsModule } from './modules/Scholarships';
import { MeetingsModule } from './modules/Meetings';
import { ReportsModule } from './modules/Reports';
import { AdminModule } from './modules/Admin';
import { SettingsModule } from './modules/Settings';
import {
  LayoutDashboard, CheckSquare, FolderKanban, FileText, Award,
  TrendingUp, GraduationCap, Users, BarChart3, Settings, Bell,
  Menu, X, Sun, Moon, Search, ChevronRight, LogOut, Cloud, CloudOff
} from 'lucide-react';

function LoginScreen() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const login = useStore(s => s.login);

  const handleLogin = () => {
    if (name.trim()) {
      login(name.trim(), token.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">Ц</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">АИС «Цезарь»</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Контур управления стратегическим развитием</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя пользователя</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Введите ваше имя"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Токен облака (опционально)</label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value.replace(/[^\x20-\x7E]/g, ''))}
              placeholder="JSONBin API Key или OAuth токен"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={!name.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/25"
          >
            Войти в систему
          </button>
        </div>
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Система работает локально без облака. Для совместной работы укажите токен JSONBin.io
          </p>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'projects', label: 'Проекты', icon: FolderKanban },
  { id: 'documents', label: 'Документы', icon: FileText },
  { id: 'grants', label: 'Гранты', icon: Award },
  { id: 'priority2030', label: 'Приоритет-2030', icon: TrendingUp },
  { id: 'scholarships', label: 'Стипендии', icon: GraduationCap },
  { id: 'meetings', label: 'Совещания', icon: Users },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
  { id: 'admin', label: 'Администрирование', icon: Settings },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

function SyncIndicator() {
  const syncStatus = useStore(s => s.syncStatus);
  const config = {
    connected: { color: 'bg-green-500', label: 'Подключено' },
    syncing: { color: 'bg-yellow-500', label: 'Синхронизация' },
    error: { color: 'bg-red-500', label: 'Ошибка' },
    disconnected: { color: 'bg-gray-400', label: 'Локально' },
  };
  const c = config[syncStatus];
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className={`w-2 h-2 rounded-full ${c.color} ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  );
}

function NotificationBell() {
  const notifications = useStore(s => s.notifications);
  const currentUser = useStore(s => s.currentUser);
  const markAllRead = useStore(s => s.markAllRead);
  const [open, setOpen] = useState(false);
  
  const userNotifs = notifications.filter(n => n.userId === currentUser || n.userId === 'all');
  const unread = userNotifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-auto">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-medium text-sm text-gray-900 dark:text-white">Уведомления</span>
            {unread > 0 && (
              <button onClick={() => { markAllRead(); }} className="text-xs text-blue-500 hover:text-blue-600">
                Прочитать все
              </button>
            )}
          </div>
          {userNotifs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Нет уведомлений</div>
          ) : (
            userNotifs.slice(0, 10).map(n => (
              <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-gray-700 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const tasks = useStore(s => s.tasks);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const results = searchQuery.length >= 2 ? [
    ...tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ type: 'Задача', name: t.title, id: t.id })),
    ...projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => ({ type: 'Проект', name: p.name, id: p.id })),
    ...grants.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => ({ type: 'Грант', name: g.name, id: g.id })),
  ].slice(0, 10) : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-gray-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск задач, проектов, грантов..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Esc</kbd>
          </div>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-auto p-2">
            {results.map((r, i) => (
              <div key={i} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">{r.type}</span>
                <span className="text-sm text-gray-900 dark:text-white">{r.name}</span>
              </div>
            ))}
          </div>
        )}
        {searchQuery.length >= 2 && results.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}

function AppLayout() {
  const { currentUser, theme, setTheme, sidebarOpen, setSidebarOpen, activeModule, setActiveModule, logout } = useStore();
  const [mobileNav, setMobileNav] = useState(false);

  const renderModule = useCallback(() => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TasksModule />;
      case 'projects': return <ProjectsModule />;
      case 'documents': return <DocumentsModule />;
      case 'grants': return <GrantsModule />;
      case 'priority2030': return <Priority2030Module />;
      case 'scholarships': return <ScholarshipsModule />;
      case 'meetings': return <MeetingsModule />;
      case 'reports': return <ReportsModule />;
      case 'admin': return <AdminModule />;
      case 'settings': return <SettingsModule />;
      default: return <Dashboard />;
    }
  }, [activeModule]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-30 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">Ц</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-sm">АИС «Цезарь»</h1>
                <SyncIndicator />
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-auto p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  activeModule === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {currentUser?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{currentUser}</span>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <LogOut size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileNav && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 overflow-auto">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">Ц</span>
                  </div>
                  <h1 className="font-bold text-gray-900 dark:text-white">Цезарь</h1>
                </div>
                <button onClick={() => setMobileNav(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveModule(item.id); setMobileNav(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                      activeModule === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : ''} transition-all`}>
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileNav(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Menu size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Menu size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="font-semibold text-gray-900 dark:text-white hidden sm:block">
                  {navItems.find(n => n.id === activeModule)?.label || 'Дашборд'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const input = prompt('Поиск (Ctrl+K):');
                    if (input) useStore.getState().setSearchQuery(input);
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block"
                >
                  <Search size={18} className="text-gray-500" />
                </button>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? <Moon size={18} className="text-gray-500" /> : <Sun size={18} className="text-yellow-400" />}
                </button>
                <NotificationBell />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">
            {renderModule()}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
          <div className="flex items-center justify-around h-14">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Главная' },
              { id: 'tasks', icon: CheckSquare, label: 'Задачи' },
              { id: 'projects', icon: FolderKanban, label: 'Проекты' },
              { id: 'meetings', icon: Users, label: 'Встречи' },
              { id: 'settings', icon: Menu, label: 'Меню' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => item.id === 'settings' ? setMobileNav(true) : setActiveModule(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  activeModule === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      <GlobalSearch />
    </div>
  );
}

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const theme = useStore(s => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!currentUser) return <LoginScreen />;
  return <AppLayout />;
}
