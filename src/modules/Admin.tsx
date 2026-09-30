import { useState } from 'react';
import { useStore } from '../store';
import { User, Role, DirectoryItem } from '../types';
import { Plus, X, Shield, BookOpen, History, Trash2 } from 'lucide-react';

const roleLabels: Record<Role, string> = {
  admin: 'Администратор',
  head: 'Руководитель',
  pm: 'Руководитель проектов',
  officer: 'Сотрудник',
  grant: 'Координатор грантов',
  scholar: 'Специалист по стипендиям',
  member: 'Участник',
  viewer: 'Наблюдатель',
};

export function AdminModule() {
  const users = useStore(s => s.users);
  const directories = useStore(s => s.directories);
  const logs = useStore(s => s.logs);
  const currentUser = useStore(s => s.currentUser);
  const [tab, setTab] = useState<'users' | 'directories' | 'logs'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDirForm, setShowDirForm] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [editDir, setEditDir] = useState<DirectoryItem | undefined>();

  // User form
  const [userForm, setUserForm] = useState({ name: '', roles: [] as Role[] });
  // Directory form
  const [dirForm, setDirForm] = useState({ name: '', type: 'direction' as DirectoryItem['type'] });

  const addUser = useStore(s => s.addLog); // We'll use the store's user management
  const store = useStore.getState();

  const handleSaveUser = () => {
    if (!userForm.name.trim()) return;
    const updatedUsers = [...users];
    if (editUser) {
      const idx = updatedUsers.findIndex(u => u.id === editUser.id);
      if (idx >= 0) updatedUsers[idx] = { ...updatedUsers[idx], name: userForm.name, roles: userForm.roles };
    } else {
      updatedUsers.push({ id: crypto.randomUUID(), name: userForm.name, roles: userForm.roles });
    }
    useStore.setState({ users: updatedUsers });
    useStore.getState().addLog('Обновлены пользователи', 'Админ', `${editUser ? 'Изменён' : 'Добавлен'} пользователь ${userForm.name}`);
    setShowUserForm(false);
    setEditUser(undefined);
    setUserForm({ name: '', roles: [] });
  };

  const handleSaveDir = () => {
    if (!dirForm.name.trim()) return;
    const updatedDirs = [...directories];
    if (editDir) {
      const idx = updatedDirs.findIndex(d => d.id === editDir.id);
      if (idx >= 0) updatedDirs[idx] = { ...updatedDirs[idx], name: dirForm.name, type: dirForm.type };
    } else {
      updatedDirs.push({ id: crypto.randomUUID(), name: dirForm.name, type: dirForm.type });
    }
    useStore.setState({ directories: updatedDirs });
    useStore.getState().addLog('Обновлены справочники', 'Админ', `${editDir ? 'Изменён' : 'Добавлен'} элемент ${dirForm.name}`);
    setShowDirForm(false);
    setEditDir(undefined);
    setDirForm({ name: '', type: 'direction' });
  };

  const deleteDir = (id: string) => {
    // Check if directory item is used
    const item = directories.find(d => d.id === id);
    if (!item) return;
    
    let usedCount = 0;
    if (item.type === 'direction') {
      usedCount = useStore.getState().projects.filter(p => p.direction === item.name).length;
    } else if (item.type === 'docType') {
      usedCount = useStore.getState().documents.filter(d => d.type === item.name).length;
    }
    
    if (usedCount > 0) {
      alert(`Нельзя удалить: элемент используется в ${usedCount} записях`);
      return;
    }
    
    if (confirm('Удалить элемент справочника?')) {
      useStore.setState({ directories: directories.filter(d => d.id !== id) });
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Администрирование</h2>

      <div className="flex gap-2">
        <button onClick={() => setTab('users')} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${tab === 'users' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500'}`}>
          <Shield size={14} /> Пользователи
        </button>
        <button onClick={() => setTab('directories')} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${tab === 'directories' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500'}`}>
          <BookOpen size={14} /> Справочники
        </button>
        <button onClick={() => setTab('logs')} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${tab === 'logs' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500'}`}>
          <History size={14} /> Журнал
        </button>
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setEditUser(undefined); setUserForm({ name: '', roles: [] }); setShowUserForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">
              <Plus size={16} /> Добавить пользователя
            </button>
          </div>
          {users.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center text-gray-400">
              Нет пользователей. Добавьте пользователей и назначьте им роли.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.roles.map(r => (
                        <span key={r} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">{roleLabels[r]}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { setEditUser(u); setUserForm({ name: u.name, roles: u.roles }); setShowUserForm(true); }}
                    className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Изменить</button>
                </div>
              ))}
            </div>
          )}

          {showUserForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUserForm(false)}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{editUser ? 'Редактировать' : 'Новый пользователь'}</h3>
                  <button onClick={() => setShowUserForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя *</label>
                    <input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Роли</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(roleLabels) as [Role, string][]).map(([r, label]) => (
                        <label key={r} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input type="checkbox" checked={userForm.roles.includes(r)} onChange={e => {
                            if (e.target.checked) setUserForm(f => ({ ...f, roles: [...f.roles, r] }));
                            else setUserForm(f => ({ ...f, roles: f.roles.filter(x => x !== r) }));
                          }} className="rounded" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button onClick={() => setShowUserForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
                  <button onClick={handleSaveUser} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'directories' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setEditDir(undefined); setDirForm({ name: '', type: 'direction' }); setShowDirForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">
              <Plus size={16} /> Добавить элемент
            </button>
          </div>
          {(['direction', 'expense', 'docType', 'status'] as const).map(type => {
            const items = directories.filter(d => d.type === type);
            const typeLabels = { direction: 'Направления', expense: 'Статьи расходов', docType: 'Виды документов', status: 'Статусы' };
            return (
              <div key={type} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{typeLabels[type]}</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map(d => (
                    <span key={d.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      {d.name}
                      <button onClick={() => deleteDir(d.id)} className="text-red-400 hover:text-red-500"><Trash2 size={10} /></button>
                    </span>
                  ))}
                  {items.length === 0 && <span className="text-xs text-gray-400">Пусто</span>}
                </div>
              </div>
            );
          })}

          {showDirForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDirForm(false)}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{editDir ? 'Редактировать' : 'Новый элемент'}</h3>
                  <button onClick={() => setShowDirForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
                    <input value={dirForm.name} onChange={e => setDirForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип</label>
                    <select value={dirForm.type} onChange={e => setDirForm(f => ({ ...f, type: e.target.value as DirectoryItem['type'] }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                      <option value="direction">Направление</option>
                      <option value="expense">Статья расходов</option>
                      <option value="docType">Вид документа</option>
                      <option value="status">Статус</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button onClick={() => setShowDirForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
                  <button onClick={handleSaveDir} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Журнал пуст</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-96 overflow-auto">
              {logs.slice(0, 100).map(l => (
                <div key={l.id} className="p-3 flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                    {l.user[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{l.action}</p>
                    <p className="text-xs text-gray-400">{l.object} — {l.details}</p>
                    <p className="text-xs text-gray-400">{l.user} • {new Date(l.timestamp).toLocaleString('ru')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
