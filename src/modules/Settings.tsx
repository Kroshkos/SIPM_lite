import { useState } from 'react';
import { useStore } from '../store';
import { Sun, Moon, Cloud, CloudOff, Download, Upload, Trash2, Bell, Database } from 'lucide-react';

export function SettingsModule() {
  const theme = useStore(s => s.theme);
  const setTheme = useStore(s => s.setTheme);
  const syncStatus = useStore(s => s.syncStatus);
  const cloudToken = useStore(s => s.cloudToken);
  const currentUser = useStore(s => s.currentUser);
  const logout = useStore(s => s.logout);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);

  const [token, setToken] = useState(cloudToken || '');
  const [telegramToken, setTelegramToken] = useState(localStorage.getItem('caesar_telegram_token') || '');
  const [telegramChatId, setTelegramChatId] = useState(localStorage.getItem('caesar_telegram_chat') || '');
  const [importText, setImportText] = useState('');

  const saveToken = () => {
    const clean = token.replace(/[^\x20-\x7E]/g, '');
    localStorage.setItem('caesar_token', clean);
    useStore.setState({ cloudToken: clean, syncStatus: clean ? 'connected' : 'disconnected' });
  };

  const saveTelegram = () => {
    localStorage.setItem('caesar_telegram_token', telegramToken);
    localStorage.setItem('caesar_telegram_chat', telegramChatId);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caesar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importText.trim()) {
      importData(importText);
      setImportText('');
      alert('Данные импортированы');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        importData(reader.result as string);
        alert('Данные импортированы из файла');
      };
      reader.readAsText(file);
    }
  };

  const clearData = () => {
    if (confirm('ВНИМАНИЕ! Все данные будут удалены. Это действие необратимо. Продолжить?')) {
      if (confirm('Вы уверены? Все проекты, задачи, гранты будут удалены!')) {
        localStorage.removeItem('caesar_data');
        window.location.reload();
      }
    }
  };

  const sendTelegramTest = async () => {
    if (!telegramToken || !telegramChatId) {
      alert('Укажите токен бота и Chat ID');
      return;
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `✅ Тестовое сообщение от АИС «Цезарь»\nПользователь: ${currentUser}\nВремя: ${new Date().toLocaleString('ru')}`,
        }),
      });
      if (res.ok) alert('Сообщение отправлено!');
      else alert('Ошибка отправки. Проверьте токен и Chat ID.');
    } catch (e) {
      alert('Ошибка сети: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки</h2>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          {theme === 'light' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-400" />}
          Тема оформления
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}>
            ☀️ Светлая
          </button>
          <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}>
            🌙 Тёмная
          </button>
        </div>
      </div>

      {/* Cloud sync */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          {syncStatus === 'connected' ? <Cloud size={18} className="text-green-500" /> : <CloudOff size={18} className="text-gray-400" />}
          Облачная синхронизация
        </h3>
        <p className="text-xs text-gray-400 mb-3">Укажите API ключ JSONBin.io для совместной работы</p>
        <div className="flex gap-2">
          <input value={token} onChange={e => setToken(e.target.value.replace(/[^\x20-\x7E]/g, ''))}
            placeholder="JSONBin API Key (X-Master-Key)"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          <button onClick={saveToken} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">Сохранить</button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${syncStatus === 'connected' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-400">
            {syncStatus === 'connected' ? 'Подключено' : syncStatus === 'syncing' ? 'Синхронизация...' : syncStatus === 'error' ? 'Ошибка соединения' : 'Локальный режим'}
          </span>
        </div>
      </div>

      {/* Telegram */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          Telegram уведомления
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
            <input value={telegramToken} onChange={e => setTelegramToken(e.target.value)}
              placeholder="123456:ABC-DEF..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Chat ID</label>
            <input value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)}
              placeholder="123456789"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveTelegram} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">Сохранить</button>
            <button onClick={sendTelegramTest} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600">Тест</button>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Database size={18} className="text-purple-500" />
          Управление данными
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600">
              <Download size={14} /> Экспорт JSON
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <Upload size={14} /> Импорт JSON
              <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Или вставьте JSON:</label>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder='{"users": [], "projects": [], ...}'
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none text-xs font-mono h-20 resize-none" />
            <button onClick={handleImport} disabled={!importText.trim()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">Импортировать</button>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <button onClick={clearData} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/30">
              <Trash2 size={14} /> Очистить все данные
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Аккаунт</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
              {currentUser?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser}</p>
              <p className="text-xs text-gray-400">Текущий пользователь</p>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600">Выйти</button>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Горячие клавиши</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd><span className="text-gray-500">Поиск</span></div>
          <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Enter</kbd><span className="text-gray-500">Сохранить</span></div>
          <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd><span className="text-gray-500">Закрыть</span></div>
          <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">N</kbd><span className="text-gray-500">Новая запись</span></div>
        </div>
      </div>
    </div>
  );
}
