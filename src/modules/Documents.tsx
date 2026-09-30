import { useState } from 'react';
import { useStore } from '../store';
import { Document, DocStatus } from '../types';
import { Plus, X, FileText, Link, Upload } from 'lucide-react';

const statusConfig: Record<DocStatus, { label: string; emoji: string }> = {
  draft: { label: 'Черновик', emoji: '⚪' },
  in_review: { label: 'На согласовании', emoji: '🟡' },
  approved: { label: 'Согласован', emoji: '🟢' },
  rejected: { label: 'Отклонён', emoji: '🔴' },
};

function DocumentForm({ doc, onClose }: { doc?: Document; onClose: () => void }) {
  const addDocument = useStore(s => s.addDocument);
  const updateDocument = useStore(s => s.updateDocument);
  const directories = useStore(s => s.directories);
  const projects = useStore(s => s.projects);
  const grants = useStore(s => s.grants);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    name: doc?.name || '',
    type: doc?.type || '',
    status: doc?.status || 'draft' as DocStatus,
    projectId: doc?.projectId || '',
    grantId: doc?.grantId || '',
    initiator: doc?.initiator || currentUser || '',
    fileUrl: doc?.fileUrl || '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(f => ({ ...f, fileUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Файл должен быть не более 1 МБ');
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (doc) {
      updateDocument(doc.id, form);
    } else {
      addDocument({ ...form });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{doc ? 'Редактировать документ' : 'Новый документ'}</h3>
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
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                <option value="">—</option>
                {directories.filter(d => d.type === 'docType').map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as DocStatus }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Инициатор</label>
            <input value={form.initiator} onChange={e => setForm(f => ({ ...f, initiator: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Файл или ссылка</label>
            <div className="flex gap-2">
              <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="URL или загрузите файл"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <label className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1">
                <Upload size={14} />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
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

export function DocumentsModule() {
  const documents = useStore(s => s.documents);
  const deleteDocument = useStore(s => s.deleteDocument);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | undefined>();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? documents : documents.filter(d => d.status === filter);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Документы ({documents.length})</h2>
        <button onClick={() => { setEditDoc(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новый документ
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[{ id: 'all', label: 'Все' }, ...Object.entries(statusConfig).map(([k, v]) => ({ id: k, label: `${v.emoji} ${v.label}` }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === f.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Нет документов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-sm transition">
              <span className="text-2xl">{statusConfig[d.status].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  {d.type && <span>{d.type}</span>}
                  <span>•</span>
                  <span>{d.initiator}</span>
                  <span>•</span>
                  <span>{new Date(d.createdAt).toLocaleDateString('ru')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.fileUrl && (
                  <span className="text-green-500" title="Файл прикреплён">
                    {d.fileUrl.startsWith('http') ? <Link size={16} /> : <FileText size={16} />}
                  </span>
                )}
                <button onClick={() => { setEditDoc(d); setShowForm(true); }} className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  Изменить
                </button>
                <button onClick={() => { if (confirm('Удалить документ?')) deleteDocument(d.id); }} className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <DocumentForm doc={editDoc} onClose={() => { setShowForm(false); setEditDoc(undefined); }} />}
    </div>
  );
}
