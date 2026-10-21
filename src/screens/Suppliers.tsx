import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Supplier } from '../db/schema';
import { putSupplier } from '../db/repos';
import { AppShell } from '../components/AppShell';
import { useTranslation } from '../i18n';
import { triggerHaptic } from '../lib/haptics';
import { ArrowLeft, Plus, Phone, Clock, Trash2, Edit3, X, Check } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState(2);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setWhatsapp('');
    setLeadTimeDays(2);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingId(s.id);
    setName(s.name);
    setWhatsapp(s.whatsapp || '');
    setLeadTimeDays(s.leadTimeDays || 2);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic(15);
    await putSupplier({
      id: editingId || undefined,
      name: name.trim(),
      whatsapp: whatsapp.trim() || undefined,
      leadTimeDays: Math.max(1, Number(leadTimeDays)),
    });

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this supplier?')) {
      triggerHaptic(15);
      await db.suppliers.delete(id);
    }
  };

  return (
    <AppShell
      headerTitle="Suppliers / सप्लायर"
      headerRightAction={
        <button
          type="button"
          onClick={() => navigate('/more')}
          className="w-8.5 h-8.5 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink-muted active:scale-90"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            Manage your wholesale dealers and distributor phone numbers.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-9 px-3 rounded-xl bg-brand text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
            <Phone className="w-10 h-10 text-ink-muted mx-auto" />
            <h4 className="text-sm font-bold text-ink">No suppliers yet</h4>
            <p className="text-xs text-ink-muted">
              Add wholesale contacts to share WhatsApp reorder lists in one tap.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs"
            >
              + Add First Supplier
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-3xl bg-surface border border-line shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-ink leading-tight truncate">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-muted">
                    {s.whatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-brand" />
                        <span>{s.whatsapp}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.leadTimeDays} days lead</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-danger/80 hover:text-danger active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-surface p-5 border border-line shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-base font-bold text-ink">
                {editingId ? 'Edit Supplier' : 'Add Wholesale Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-canvas text-ink-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 pt-3">
              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">
                  Supplier / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sharma Grocery Wholesale"
                  className="w-full min-h-[44px] px-3 rounded-xl bg-canvas border border-line text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full min-h-[44px] px-3 rounded-xl bg-canvas border border-line text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">
                  Lead Time (Days to deliver)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-canvas border border-line text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-brand text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('action.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};
