import { useState } from 'react';
import { useStore } from '../store';
import { Campaign, Application } from '../types';
import { Plus, X, GraduationCap, Printer } from 'lucide-react';

function CampaignForm({ campaign, onClose }: { campaign?: Campaign; onClose: () => void }) {
  const addCampaign = useStore(s => s.addCampaign);
  const updateCampaign = useStore(s => s.updateCampaign);

  const [form, setForm] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'Именная стипендия',
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
    status: campaign?.status || 'planning' as Campaign['status'],
    applications: campaign?.applications || [] as Application[],
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (campaign) {
      updateCampaign(campaign.id, form);
    } else {
      addCampaign(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{campaign ? 'Редактировать кампанию' : 'Новая кампания'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип</label>
              <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Campaign['status'] }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                <option value="planning">Планирование</option>
                <option value="active">Активная</option>
                <option value="completed">Завершена</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Начало</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Окончание</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
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

export function ScholarshipsModule() {
  const campaigns = useStore(s => s.campaigns);
  const updateCampaign = useStore(s => s.updateCampaign);
  const deleteCampaign = useStore(s => s.deleteCampaign);
  const [showForm, setShowForm] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | undefined>();
  const [newApp, setNewApp] = useState({ campaignId: '', applicantName: '', amount: 0 });

  const addApplication = () => {
    if (!newApp.campaignId || !newApp.applicantName) return;
    const c = campaigns.find(c => c.id === newApp.campaignId);
    if (!c) return;
    const app: Application = {
      id: crypto.randomUUID(),
      campaignId: newApp.campaignId,
      applicantName: newApp.applicantName,
      status: 'submitted',
      rating: 0,
      amount: newApp.amount || undefined,
    };
    updateCampaign(newApp.campaignId, { applications: [...c.applications, app] });
    setNewApp({ campaignId: '', applicantName: '', amount: 0 });
  };

  const handlePrint = (c: Campaign) => {
    const approved = c.applications.filter(a => a.status === 'approved');
    const content = `
      <html><head><title>Приказ — ${c.name}</title>
      <style>body{font-family:serif;padding:40px;max-width:800px;margin:auto}h1{text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #333;padding:8px;text-align:left}.sig{margin-top:60px;display:flex;justify-content:space-between}</style></head>
      <body>
        <h1>ПРИКАЗ</h1>
        <p style="text-align:center">О назначении именных стипендий</p>
        <p>${c.name}</p>
        <table><tr><th>№</th><th>ФИО</th><th>Сумма</th></tr>
        ${approved.map((a, i) => `<tr><td>${i + 1}</td><td>${a.applicantName}</td><td>${a.amount?.toLocaleString('ru') || '—'} ₽</td></tr>`).join('')}
        </table>
        <div class="sig"><span>Ректор _________</span><span>Дата ___________</span></div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(content); w.document.close(); w.print(); }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Именные стипендии</h2>
        <button onClick={() => { setEditCampaign(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новая кампания
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Нет кампаний. Создайте первую кампанию по назначению стипендий.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                  <p className="text-xs text-gray-400">{c.type} • {c.startDate} — {c.endDate}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${c.status === 'active' ? 'bg-green-500' : c.status === 'completed' ? 'bg-gray-400' : 'bg-blue-500'}`}>
                  {c.status === 'active' ? 'Активная' : c.status === 'completed' ? 'Завершена' : 'Планирование'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{c.applications.length}</p>
                  <p className="text-xs text-gray-400">Заявок</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-600">{c.applications.filter(a => a.status === 'approved').length}</p>
                  <p className="text-xs text-gray-400">Одобрено</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {c.applications.filter(a => a.status === 'approved').reduce((s, a) => s + (a.amount || 0), 0).toLocaleString('ru')} ₽
                  </p>
                  <p className="text-xs text-gray-400">Сумма</p>
                </div>
              </div>

              {/* Applications */}
              {c.applications.length > 0 && (
                <div className="mb-3 space-y-1">
                  {c.applications.map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className={`w-2 h-2 rounded-full ${a.status === 'approved' ? 'bg-green-500' : a.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{a.applicantName}</span>
                      <span className="text-xs text-gray-400">{a.amount?.toLocaleString('ru')} ₽</span>
                      <select value={a.status} onChange={e => {
                        const apps = c.applications.map(app => app.id === a.id ? { ...app, status: e.target.value as Application['status'] } : app);
                        updateCampaign(c.id, { applications: apps });
                      }} className="text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <option value="submitted">Подана</option>
                        <option value="approved">Одобрена</option>
                        <option value="rejected">Отклонена</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Add application */}
              <div className="flex gap-2 mb-3">
                <input value={newApp.campaignId === c.id ? newApp.applicantName : ''} onFocus={() => setNewApp(n => ({ ...n, campaignId: c.id }))}
                  onChange={e => setNewApp(n => ({ ...n, applicantName: e.target.value }))}
                  placeholder="ФИО заявителя" className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
                <input type="number" value={newApp.campaignId === c.id ? newApp.amount || '' : ''} onFocus={() => setNewApp(n => ({ ...n, campaignId: c.id }))}
                  onChange={e => setNewApp(n => ({ ...n, amount: +e.target.value }))}
                  placeholder="Сумма" className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none" />
                <button onClick={addApplication} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">+</button>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                <button onClick={() => { setEditCampaign(c); setShowForm(true); }} className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Изменить</button>
                <button onClick={() => handlePrint(c)} className="text-xs text-purple-500 hover:text-purple-600 px-2 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-1">
                  <Printer size={12} /> Приказ
                </button>
                <button onClick={() => { if (confirm('Удалить кампанию?')) deleteCampaign(c.id); }} className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <CampaignForm campaign={editCampaign} onClose={() => { setShowForm(false); setEditCampaign(undefined); }} />}
    </div>
  );
}
