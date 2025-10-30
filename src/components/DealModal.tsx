import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { supabase, Deal, Contact } from '../lib/supabase';

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSave: () => void;
}

export default function DealModal({ deal, onClose, onSave }: DealModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dealData, setDealData] = useState({
    name: deal?.name || '',
    contact_id: deal?.contact_id || '',
    value: deal?.value || '',
    stage: deal?.stage || 'Lead',
    expected_close_date: deal?.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
    probability: deal?.probability || 50,
    description: deal?.description || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('full_name');

    if (data) {
      setContacts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealData.name.trim() || !dealData.contact_id) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    if (deal) {
      const updatePayload: any = {
        name: dealData.name.trim(),
        contact_id: dealData.contact_id,
        value: Number(dealData.value) || 0,
        stage: dealData.stage,
        probability: dealData.probability,
        updated_at: new Date().toISOString(),
      };

      if (dealData.expected_close_date) {
        updatePayload.expected_close_date = dealData.expected_close_date;
      }

      if (dealData.description.trim()) {
        updatePayload.description = dealData.description.trim();
      }

      const { error } = await supabase
        .from('deals')
        .update(updatePayload)
        .eq('id', deal.id);

      if (error) {
        console.error('Error updating deal:', error);
        alert(`Failed to update deal: ${error.message}`);
        setSaving(false);
        return;
      }

      await supabase.from('contact_activities').insert({
        contact_id: dealData.contact_id,
        activity_type: 'status_change',
        content: `Deal "${dealData.name}" updated`,
      });
    } else {
      const dealPayload: any = {
        name: dealData.name.trim(),
        contact_id: dealData.contact_id,
        value: Number(dealData.value) || 0,
        stage: dealData.stage,
        probability: dealData.probability,
      };

      if (dealData.expected_close_date) {
        dealPayload.expected_close_date = dealData.expected_close_date;
      }

      if (dealData.description.trim()) {
        dealPayload.description = dealData.description.trim();
      }

      const { data: newDeal, error } = await supabase
        .from('deals')
        .insert([dealPayload])
        .select()
        .single();

      if (error) {
        console.error('Error creating deal:', error);
        alert(`Failed to create deal: ${error.message}`);
        setSaving(false);
        return;
      }

      if (newDeal) {
        await supabase.from('contact_activities').insert({
          contact_id: dealData.contact_id,
          activity_type: 'created',
          content: `Deal created: ${dealData.name} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(dealData.value) || 0)})`,
        });
      }
    }

    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border-2 border-cyan-500/40 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex justify-between items-center border-b border-cyan-500/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {deal ? 'Edit Deal' : 'Create New Deal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Deal Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={dealData.name}
              onChange={(e) => setDealData({ ...dealData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              placeholder="e.g., Enterprise Software License"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Associated Contact <span className="text-red-400">*</span>
            </label>
            <select
              value={dealData.contact_id}
              onChange={(e) => setDealData({ ...dealData, contact_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              required
            >
              <option value="">Select a contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.full_name} {contact.company ? `(${contact.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Deal Value ($)
              </label>
              <input
                type="number"
                value={dealData.value}
                onChange={(e) => setDealData({ ...dealData, value: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Stage
              </label>
              <select
                value={dealData.stage}
                onChange={(e) => setDealData({ ...dealData, stage: e.target.value as Deal['stage'] })}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              >
                <option value="Lead">Lead</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                value={dealData.expected_close_date}
                onChange={(e) => setDealData({ ...dealData, expected_close_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Probability (%)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={dealData.probability}
                  onChange={(e) => setDealData({ ...dealData, probability: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 text-sm">0%</span>
                  <span className="text-cyan-100 font-bold text-lg">{dealData.probability}%</span>
                  <span className="text-cyan-400 text-sm">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Description
            </label>
            <textarea
              value={dealData.description}
              onChange={(e) => setDealData({ ...dealData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all resize-none"
              placeholder="Add any notes or details about this deal..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-cyan-100 rounded-xl font-medium hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !dealData.name.trim() || !dealData.contact_id}
              className="flex-1 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
