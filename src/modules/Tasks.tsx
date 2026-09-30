import { useState } from 'react';
import { useStore } from '../store';
import { Task, TaskStatus } from '../types';
import { Plus, X, GripVertical, Calendar, User, Flag } from 'lucide-react';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Бэклог', color: 'bg-gray-400' },
  { id: 'in_progress', label: 'В работе', color: 'bg-blue-500' },
  { id: 'review', label: 'На проверке', color: 'bg-yellow-500' },
  { id: 'done', label: 'Готово', color: 'bg-green-500' },
  { id: 'blocked', label: 'На блоке', color: 'bg-red-500' },
];

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
};

const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };

function TaskCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const updateTask = useStore(s => s.updateTask);
  const deleteTask = useStore(s => s.deleteTask);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-gray-300 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{task.title}</p>
          {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs ${priorityColors[task.priority]} flex items-center gap-0.5`}>
              <Flag size={10} /> {priorityLabels[task.priority]}
            </span>
            {task.assignee && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <User size={10} /> {task.assignee}
              </span>
            )}
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                <Calendar size={10} /> {task.dueDate}
              </span>
            )}
          </div>
          {task.checklist && task.checklist.length > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(task.checklist.filter(c => c.done).length / task.checklist.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {task.checklist.filter(c => c.done).length}/{task.checklist.length}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
        <button onClick={() => onEdit(task)} className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
          Изменить
        </button>
        <button onClick={() => { if (confirm('Удалить задачу?')) deleteTask(task.id); }} className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
          Удалить
        </button>
      </div>
    </div>
  );
}

function TaskForm({ task, onClose }: { task?: Task; onClose: () => void }) {
  const addTask = useStore(s => s.addTask);
  const updateTask = useStore(s => s.updateTask);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'backlog' as TaskStatus,
    assignee: task?.assignee || currentUser || '',
    projectId: task?.projectId || '',
    grantId: task?.grantId || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'medium' as Task['priority'],
    checklist: task?.checklist || [] as { text: string; done: boolean }[],
  });
  const [newCheckItem, setNewCheckItem] = useState('');

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (task) {
      updateTask(task.id, form);
    } else {
      addTask({ ...form, createdBy: currentUser || '' });
    }
    onClose();
  };

  const addCheckItem = () => {
    if (newCheckItem.trim()) {
      setForm(f => ({ ...f, checklist: [...f.checklist, { text: newCheckItem, done: false }] }));
      setNewCheckItem('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{task ? 'Редактировать задачу' : 'Новая задача'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Приоритет</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Исполнитель</label>
              <input value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Срок</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Проект</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                <option value="">—</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Грант</label>
              <select value={form.grantId} onChange={e => setForm(f => ({ ...f, grantId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                <option value="">—</option>
                {grants.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Чек-лист</label>
            <div className="space-y-1 mb-2">
              {form.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" checked={item.done} onChange={() => {
                    const cl = [...form.checklist];
                    cl[i] = { ...cl[i], done: !cl[i].done };
                    setForm(f => ({ ...f, checklist: cl }));
                  }} className="rounded" />
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.text}</span>
                  <button onClick={() => setForm(f => ({ ...f, checklist: f.checklist.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} placeholder="Пункт чек-листа"
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none text-sm" />
              <button onClick={addCheckItem} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export function TasksModule() {
  const tasks = useStore(s => s.tasks);
  const updateTask = useStore(s => s.updateTask);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>('backlog');

  const handleDrop = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) updateTask(taskId, { status });
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'kanban' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>Канбан</button>
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>Список</button>
        </div>
        <button onClick={() => { setEditTask(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новая задача
        </button>
      </div>

      {view === 'kanban' ? (
        <>
          {/* Mobile column selector */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2">
            {columns.map(c => (
              <button key={c.id} onClick={() => setMobileColumn(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex items-center gap-1.5 ${mobileColumn === c.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${c.color}`} />
                {c.label} ({tasks.filter(t => t.status === c.id).length})
              </button>
            ))}
          </div>

          {/* Desktop kanban */}
          <div className="hidden lg:grid grid-cols-5 gap-3">
            {columns.map(col => (
              <div key={col.id} className="space-y-2"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop(col.id)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{col.label}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{tasks.filter(t => t.status === col.id).length}</span>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {tasks.filter(t => t.status === col.id).map(t => (
                    <TaskCard key={t.id} task={t} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile kanban */}
          <div className="lg:hidden">
            <div className="space-y-2 min-h-[200px]"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop(mobileColumn)}>
              {tasks.filter(t => t.status === mobileColumn).map(t => (
                <TaskCard key={t.id} task={t} onEdit={handleEdit} />
              ))}
              {tasks.filter(t => t.status === mobileColumn).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Нет задач</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Задача</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Приоритет</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Исполнитель</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Срок</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = t.dueDate && t.dueDate < today && t.status !== 'done';
                  return (
                    <tr key={t.id} className="border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => handleEdit(t)}>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{t.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${columns.find(c => c.id === t.status)?.color} text-white`}>
                          {columns.find(c => c.id === t.status)?.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.assignee}</td>
                      <td className={`px-4 py-3 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{t.dueDate || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-gray-50 dark:divide-gray-700">
            {tasks.map(t => (
              <div key={t.id} className="p-4" onClick={() => handleEdit(t)}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${columns.find(c => c.id === t.status)?.color} text-white`}>
                    {columns.find(c => c.id === t.status)?.label}
                  </span>
                  <span className="text-xs text-gray-400">{t.assignee}</span>
                  {t.dueDate && <span className="text-xs text-gray-400">{t.dueDate}</span>}
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">Нет задач</p>}
          </div>
        </div>
      )}

      {showForm && <TaskForm task={editTask} onClose={() => { setShowForm(false); setEditTask(undefined); }} />}
    </div>
  );
}
