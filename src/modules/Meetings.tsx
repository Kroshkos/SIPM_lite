import { useState } from 'react';
import { useStore } from '../store';
import { Meeting, Decision } from '../types';
import { Plus, X, Users, Printer, Zap, CheckCircle2 } from 'lucide-react';

function MeetingForm({ meeting, onClose }: { meeting?: Meeting; onClose: () => void }) {
  const addMeeting = useStore(s => s.addMeeting);
  const updateMeeting = useStore(s => s.updateMeeting);
  const addDecision = useStore(s => s.addDecision);
  const convertDecisionsToTasks = useStore(s => s.convertDecisionsToTasks);
  const tasks = useStore(s => s.tasks);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);
  const indicators = useStore(s => s.indicators);
  const risks = useStore(s => s.risks);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    title: meeting?.title || '',
    date: meeting?.date || new Date().toISOString().split('T')[0],
    location: meeting?.location || '',
    participants: meeting?.participants || [currentUser || ''],
    agenda: meeting?.agenda || [] as string[],
    protocol: meeting?.protocol || '',
  });
  const [newParticipant, setNewParticipant] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [decisions, setDecisions] = useState<Decision[]>(meeting?.decisions || []);
  const [newDecision, setNewDecision] = useState({ text: '', assignee: '', dueDate: '', objectType: '' as Decision['objectType'], objectId: '' });

  const generateAutoAgenda = () => {
    const today = new Date().toISOString().split('T')[0];
    const items: string[] = [];
    
    // Overdue tasks
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done');
    if (overdue.length > 0) items.push(`Просроченные задачи (${overdue.length} шт.)`);
    
    // Red zone projects
    const redProjects = projects.filter(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      return pTasks.some(t => t.dueDate && t.dueDate < today && t.status !== 'done');
    });
    if (redProjects.length > 0) items.push(`Проекты в красной зоне: ${redProjects.map(p => p.name).join(', ')}`);
    
    // Blocked tasks
    const blocked = tasks.filter(t => t.status === 'blocked');
    if (blocked.length > 0) items.push(`Задачи на блоке (${blocked.length} шт.)`);
    
    // High risks
    const highRisks = risks.filter(r => (r.impact === 'critical' || r.impact === 'high') && r.status === 'open');
    if (highRisks.length > 0) items.push(`Критические риски (${highRisks.length} шт.)`);
    
    // Behind indicators
    const behind = indicators.filter(i => i.planValue > 0 && (i.factValue / i.planValue) < 0.8);
    if (behind.length > 0) items.push(`Показатели П-2030 с отставанием (${behind.length} шт.)`);
    
    // Upcoming grant reports
    const grantDeadlines = grants.filter(g => g.status === 'executing' && g.endDate && new Date(g.endDate).getTime() - Date.now() < 14 * 86400000);
    if (grantDeadlines.length > 0) items.push(`Приближающаяся отчётность по грантам (${grantDeadlines.length} шт.)`);

    if (items.length === 0) items.push('Обсуждение текущих вопросов');
    setForm(f => ({ ...f, agenda: items }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const meetingData = { ...form, decisions };
    if (meeting) {
      updateMeeting(meeting.id, meetingData);
    } else {
      addMeeting(meetingData);
    }
    // Save decisions separately
    decisions.forEach(d => {
      if (!d.id) addDecision({ ...d, meetingId: meeting?.id || 'new' });
    });
    onClose();
  };

  const addDec = () => {
    if (!newDecision.text.trim()) return;
    setDecisions(d => [...d, { ...newDecision, id: crypto.randomUUID(), meetingId: meeting?.id || 'new', status: 'pending' } as Decision]);
    setNewDecision({ text: '', assignee: '', dueDate: '', objectType: '' as Decision['objectType'], objectId: '' });
  };

  const handlePrintAgenda = () => {
    const content = `
      <html><head><title>Повестка совещания</title>
      <style>body{font-family:serif;padding:40px;max-width:800px;margin:auto}h1{text-align:center;font-size:18px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #333;padding:8px;text-align:left}.header{text-align:center;margin-bottom:20px}</style></head>
      <body>
        <div class="header">
          <h1>ПОВЕСТКА СОВЕЩАНИЯ</h1>
          <p>${form.title}</p>
          <p>Дата: ${form.date} | Место: ${form.location}</p>
          <p>Участники: ${form.participants.join(', ')}</p>
        </div>
        <table>
          <tr><th>№</th><th>Вопрос повестки</th><th>Докладчик</th><th>Решение</th><th>Голосование</th></tr>
          ${form.agenda.map((a, i) => `<tr><td>${i + 1}</td><td>${a}</td><td></td><td></td><td></td></tr>`).join('')}
        </table>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); w.print(); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{meeting ? 'Редактировать совещание' : 'Новое совещание'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тема *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Место / Ссылка</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Участники</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {form.participants.map((p, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs flex items-center gap-1">
                  {p}
                  <button onClick={() => setForm(f => ({ ...f, participants: f.participants.filter((_, j) => j !== i) }))}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newParticipant} onChange={e => setNewParticipant(e.target.value)} placeholder="Имя участника"
                onKeyDown={e => { if (e.key === 'Enter' && newParticipant) { setForm(f => ({ ...f, participants: [...f.participants, newParticipant] })); setNewParticipant(''); }}}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
              <button onClick={() => { if (newParticipant) { setForm(f => ({ ...f, participants: [...f.participants, newParticipant] })); setNewParticipant(''); }}}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">+</button>
            </div>
          </div>

          {/* Auto Agenda */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Повестка</label>
              <button onClick={generateAutoAgenda} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50">
                <Zap size={12} /> Автоповестка
              </button>
            </div>
            <div className="space-y-1 mb-2">
              {form.agenda.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{a}</span>
                  <button onClick={() => setForm(f => ({ ...f, agenda: f.agenda.filter((_, j) => j !== i) }))} className="text-red-400"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAgenda} onChange={e => setNewAgenda(e.target.value)} placeholder="Пункт повестки"
                onKeyDown={e => { if (e.key === 'Enter' && newAgenda) { setForm(f => ({ ...f, agenda: [...f.agenda, newAgenda] })); setNewAgenda(''); }}}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
              <button onClick={() => { if (newAgenda) { setForm(f => ({ ...f, agenda: [...f.agenda, newAgenda] })); setNewAgenda(''); }}}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">+</button>
            </div>
            <button onClick={handlePrintAgenda} className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Printer size={12} /> Печать повестки
            </button>
          </div>

          {/* Protocol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Протокол</label>
            <textarea value={form.protocol} onChange={e => setForm(f => ({ ...f, protocol: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="Ход обсуждения..." />
          </div>

          {/* Decisions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Решения</label>
            {decisions.length > 0 && (
              <div className="space-y-1 mb-2">
                {decisions.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <CheckCircle2 size={14} className="text-yellow-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{d.text}</p>
                      <p className="text-xs text-gray-400">{d.assignee} • до {d.dueDate}</p>
                    </div>
                    <button onClick={() => setDecisions(ds => ds.filter((_, j) => j !== i))} className="text-red-400"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <input value={newDecision.text} onChange={e => setNewDecision(d => ({ ...d, text: e.target.value }))} placeholder="Формулировка решения"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input value={newDecision.assignee} onChange={e => setNewDecision(d => ({ ...d, assignee: e.target.value }))} placeholder="Ответственный"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
                <input type="date" value={newDecision.dueDate} onChange={e => setNewDecision(d => ({ ...d, dueDate: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={newDecision.objectType} onChange={e => setNewDecision(d => ({ ...d, objectType: e.target.value as Decision['objectType'], objectId: '' }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none">
                  <option value="">Привязка к объекту</option>
                  <option value="project">Проект</option>
                  <option value="grant">Грант</option>
                  <option value="indicator">Показатель</option>
                  <option value="campaign">Кампания</option>
                </select>
                <select value={newDecision.objectId} onChange={e => setNewDecision(d => ({ ...d, objectId: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none">
                  <option value="">—</option>
                  {newDecision.objectType === 'project' && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  {newDecision.objectType === 'grant' && grants.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  {newDecision.objectType === 'indicator' && indicators.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <button onClick={addDec} className="w-full py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm hover:bg-yellow-200">Добавить решение</button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <button onClick={() => { if (meeting) convertDecisionsToTasks(meeting.id); }} className="px-4 py-2 rounded-xl text-sm bg-green-500 text-white hover:bg-green-600 font-medium flex items-center gap-2">
            <Zap size={14} /> В задачи
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetingsModule() {
  const meetings = useStore(s => s.meetings);
  const decisions = useStore(s => s.decisions);
  const deleteMeeting = useStore(s => s.deleteMeeting);
  const updateDecision = useStore(s => s.updateDecision);
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | undefined>();
  const [tab, setTab] = useState<'meetings' | 'decisions'>('meetings');

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('meetings')} className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'meetings' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500'}`}>
            Совещания ({meetings.length})
          </button>
          <button onClick={() => setTab('decisions')} className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'decisions' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500'}`}>
            Решения ({decisions.length})
          </button>
        </div>
        {tab === 'meetings' && (
          <button onClick={() => { setEditMeeting(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
            <Plus size={16} /> Новое совещание
          </button>
        )}
      </div>

      {tab === 'meetings' ? (
        meetings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">Нет совещаний. Создайте первое совещание.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{m.title}</h3>
                    <p className="text-xs text-gray-400">{m.date} • {m.location}</p>
                  </div>
                  <span className="text-xs text-gray-400">{m.decisions.length} решений</span>
                </div>
                {m.agenda.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Повестка:</p>
                    <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-0.5">
                      {m.agenda.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
                      {m.agenda.length > 3 && <li className="text-gray-400">...и ещё {m.agenda.length - 3}</li>}
                    </ol>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <button onClick={() => { setEditMeeting(m); setShowForm(true); }} className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Открыть</button>
                  <button onClick={() => { if (confirm('Удалить совещание?')) deleteMeeting(m.id); }} className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        decisions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-400">Нет решений</p>
          </div>
        ) : (
          <div className="space-y-2">
            {decisions.map(d => {
              const today = new Date().toISOString().split('T')[0];
              const isOverdue = d.dueDate < today && d.status !== 'done';
              return (
                <div key={d.id} className={`bg-white dark:bg-gray-800 rounded-xl p-3 border ${isOverdue ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${d.status === 'done' ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{d.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{d.assignee} • до {d.dueDate} {isOverdue && '⚠️ Просрочено'}</p>
                    </div>
                    <select value={d.status} onChange={e => updateDecision(d.id, { status: e.target.value as Decision['status'] })}
                      className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <option value="pending">Ожидает</option>
                      <option value="in_progress">В работе</option>
                      <option value="done">Исполнено</option>
                      <option value="overdue">Просрочено</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showForm && <MeetingForm meeting={editMeeting} onClose={() => { setShowForm(false); setEditMeeting(undefined); }} />}
    </div>
  );
}
