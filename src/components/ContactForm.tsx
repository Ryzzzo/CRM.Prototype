import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Contact } from '../lib/supabase';

interface ContactFormProps {
  contact?: Contact | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ContactForm({ contact, onClose, onSave }: ContactFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    status: 'Lead',
    tags: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        full_name: contact.full_name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        status: contact.status,
        tags: contact.tags.join(', '),
        notes: contact.notes,
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const contactData = {
      full_name: formData.full_name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      tags: tagsArray,
      notes: formData.notes,
      updated_at: new Date().toISOString(),
    };

    if (contact) {
      const { error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', contact.id);

      if (!error) {
        await supabase.from('contact_activities').insert({
          contact_id: contact.id,
          activity_type: 'note',
          content: 'Contact information updated',
        });
        onSave();
      }
    } else {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (!error && data) {
        await supabase.from('contact_activities').insert({
          contact_id: data.id,
          activity_type: 'note',
          content: 'Contact created',
        });
        onSave();
      }
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 gradient-primary px-6 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              >
                <option>Lead</option>
                <option>Contacted</option>
                <option>Proposal</option>
                <option>Closed Won</option>
                <option>Closed Lost</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="VIP, Enterprise, etc. (comma separated)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              placeholder="Any additional notes about this contact..."
            />
          </div>

          <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-button text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
