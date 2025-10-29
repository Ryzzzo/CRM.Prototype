import { useEffect, useState, useRef } from 'react';
import { X, Edit2, Trash2, Mail, Calendar, Phone, MessageSquare } from 'lucide-react';
import { supabase, Contact, ContactActivity } from '../lib/supabase';
import TaskSection from './TaskSection';
import NotesSection from './NotesSection';
import QuickActionsBar from './QuickActionsBar';

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onUpdate: () => void;
}

export default function ContactDetailModal({ contact, onClose, onEdit, onDelete, onUpdate }: ContactDetailModalProps) {
  const [currentContact, setCurrentContact] = useState<Contact>(contact);
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadActivities();
  }, [contact.id]);

  const loadActivities = async () => {
    const { data } = await supabase
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: false });

    if (data) {
      setActivities(data);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', contact.id);

    if (!error) {
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'status_change',
        content: `Status changed to ${newStatus}`,
      });

      setCurrentContact({ ...currentContact, status: newStatus as Contact['status'] });
      loadActivities();
      onUpdate();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'email') {
      setShowEmailModal(true);
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'email',
        content: 'Email compose opened',
      });
    } else if (action === 'meeting') {
      setShowMeetingModal(true);
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'note',
        content: 'Meeting scheduler opened',
      });
    } else if (action === 'note') {
      notesRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'task') {
      tasksRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    loadActivities();
    onUpdate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return '📝';
      case 'status_change':
        return '🔄';
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      default:
        return '•';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 gradient-primary px-6 py-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-3xl font-bold text-white">{currentContact.full_name}</h2>
            <p className="text-indigo-100 mt-1">{currentContact.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <QuickActionsBar
            onSendEmail={() => handleQuickAction('email')}
            onScheduleMeeting={() => handleQuickAction('meeting')}
            onAddNote={() => handleQuickAction('note')}
            onCreateTask={() => handleQuickAction('task')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 card-hover">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Contact Info</h3>
                <div className="space-y-4">
                  {currentContact.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <a href={`mailto:${currentContact.email}`} className="text-sm text-gray-900 hover:text-indigo-600 transition-colors">
                          {currentContact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {currentContact.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <a href={`tel:${currentContact.phone}`} className="text-sm text-gray-900 hover:text-indigo-600 transition-colors">
                          {currentContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Last Contact</p>
                      <p className="text-sm text-gray-900">{formatDate(currentContact.last_contact_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 card-hover">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Status & Tags</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Pipeline Status</p>
                    <select
                      value={currentContact.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      <option>Lead</option>
                      <option>Contacted</option>
                      <option>Proposal</option>
                      <option>Closed Won</option>
                      <option>Closed Lost</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {currentContact.tags && currentContact.tags.length > 0 ? (
                        currentContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {currentContact.notes && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-600" />
                    General Notes
                  </h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentContact.notes}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div ref={tasksRef} className="bg-white rounded-xl border-2 border-gray-200 p-5">
                <TaskSection contactId={contact.id} onUpdate={() => { loadActivities(); onUpdate(); }} />
              </div>

              <div ref={notesRef} className="bg-white rounded-xl border-2 border-gray-200 p-5">
                <NotesSection contactId={contact.id} onUpdate={() => { loadActivities(); onUpdate(); }} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => onEdit(currentContact)}
              className="flex items-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium"
            >
              <Edit2 size={18} />
              Edit Contact
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this contact?')) {
                  onDelete(currentContact);
                }
              }}
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Send Email</h3>
            <p className="text-gray-600 mb-4">
              This would open your email client to compose an email to {currentContact.email}
            </p>
            <button
              onClick={() => setShowEmailModal(false)}
              className="gradient-button text-white px-4 py-2 rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Schedule Meeting</h3>
            <p className="text-gray-600 mb-4">
              This would open a meeting scheduler for {currentContact.full_name}
            </p>
            <button
              onClick={() => setShowMeetingModal(false)}
              className="gradient-button text-white px-4 py-2 rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
