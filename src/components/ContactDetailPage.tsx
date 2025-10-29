import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit2, Trash2, Mail, Phone, Building2, User, FileText, Clock, CheckSquare, Folder, Save, Plus, RefreshCw, Calendar, MessageSquare, PhoneCall, Send } from 'lucide-react';
import { supabase, Contact, ContactActivity, Task } from '../lib/supabase';

interface ContactDetailPageProps {
  contact: Contact;
  onBack: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onUpdate: () => void;
}

type TabType = 'overview' | 'activity' | 'tasks' | 'files';

interface ActivityWithType extends ContactActivity {
  icon: string;
  color: string;
}

export default function ContactDetailPage({
  contact: initialContact,
  onBack,
  onEdit,
  onDelete,
  onUpdate,
}: ContactDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [contact, setContact] = useState<Contact>(initialContact);
  const [notes, setNotes] = useState(initialContact.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusSaved, setStatusSaved] = useState(false);

  useEffect(() => {
    loadActivities();
    loadTasks();
  }, [contact.id]);

  const loadActivities = async () => {
    const { data } = await supabase
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: false });

    if (data) {
      const enrichedActivities = data.map((activity) => {
        let icon = '📝';
        let color = 'text-purple-400';

        switch (activity.activity_type) {
          case 'created':
            icon = '👤';
            color = 'text-green-400';
            break;
          case 'status_change':
            icon = '🔄';
            color = 'text-blue-400';
            break;
          case 'note':
            icon = '📝';
            color = 'text-purple-400';
            break;
          case 'email':
            icon = '📧';
            color = 'text-cyan-400';
            break;
          case 'meeting':
            icon = '📅';
            color = 'text-yellow-400';
            break;
          case 'call':
            icon = '📞';
            color = 'text-teal-400';
            break;
        }

        return { ...activity, icon, color };
      });

      setActivities(enrichedActivities);
    }
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('contact_id', contact.id)
      .order('due_date', { ascending: true });

    if (data) {
      setTasks(data);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);

    const { error } = await supabase
      .from('contacts')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', contact.id);

    if (!error) {
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'note',
        content: 'Note updated',
      });

      setContact({ ...contact, notes });
      loadActivities();
      onUpdate();
    }

    setSavingNotes(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === contact.status) return;

    const oldStatus = contact.status;

    // Update local state immediately for instant UI feedback
    setContact(prev => ({ ...prev, status: newStatus as Contact['status'] }));

    const { error } = await supabase
      .from('contacts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', contact.id);

    if (!error) {
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'status_change',
        content: `Status changed from ${oldStatus} to ${newStatus}`,
      });

      loadActivities();
      onUpdate();

      // Show success notification
      setStatusSaved(true);
      setTimeout(() => setStatusSaved(false), 2000);
    } else {
      // Revert on error
      setContact(prev => ({ ...prev, status: oldStatus }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'Contacted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Proposal':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Closed Won':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'Closed Lost':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPendingTasksCount = () => {
    return tasks.filter((t) => !t.completed).length;
  };

  const getFilteredTasks = () => {
    const now = new Date();

    switch (taskFilter) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      case 'overdue':
        return tasks.filter((t) => !t.completed && new Date(t.due_date) < now);
      default:
        return tasks;
    }
  };

  const isTaskOverdue = (task: Task) => {
    return !task.completed && new Date(task.due_date) < new Date();
  };

  const handleToggleTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed, updated_at: new Date().toISOString() })
      .eq('id', task.id);

    if (!error) {
      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'note',
        content: `Task ${task.completed ? 'reopened' : 'completed'}: ${task.title}`,
      });

      loadTasks();
      loadActivities();
      onUpdate();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (!error) {
      loadTasks();
      onUpdate();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Contacts</span>
      </button>

      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-cyan-500/40 shadow-cyan-500/10 overflow-hidden">
        <div className="gradient-cosmic p-8 border-b border-cyan-500/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-cyan-100 mb-2">{contact.full_name}</h1>
              {contact.company && (
                <p className="text-xl text-cyan-300 mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  {contact.company}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100 transition-colors"
                  >
                    <Mail size={16} />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100 transition-colors"
                  >
                    <Phone size={16} />
                    {contact.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(contact)}
                className="flex items-center gap-2 bg-cyan-500/20 text-cyan-100 px-4 py-2 rounded-xl hover:bg-cyan-500/30 transition-all border border-cyan-500/40"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this contact?')) {
                    onDelete(contact);
                  }
                }}
                className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all border border-red-500/40"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-cyan-500/30">
          <div className="flex gap-1 p-2">
            {(['overview', 'activity', 'tasks', 'files'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-100 border-b-2 border-cyan-400'
                    : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {tab === 'overview' && <User size={18} />}
                {tab === 'activity' && <Clock size={18} />}
                {tab === 'tasks' && (
                  <>
                    <CheckSquare size={18} />
                    {getPendingTasksCount() > 0 && (
                      <span className="bg-cyan-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {getPendingTasksCount()}
                      </span>
                    )}
                  </>
                )}
                {tab === 'files' && <Folder size={18} />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-cyan-100 uppercase tracking-wide">Contact Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-cyan-400 mb-1">Full Name</p>
                      <p className="text-cyan-100">{contact.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-400 mb-1">Email</p>
                      <p className="text-cyan-100">{contact.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-400 mb-1">Phone</p>
                      <p className="text-cyan-100">{contact.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-400 mb-1">Company</p>
                      <p className="text-cyan-100">{contact.company || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-cyan-100 uppercase tracking-wide">Status & Tags</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-cyan-400 mb-2">Current Status</p>
                      <div className="relative">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-cyan-100 transition-all"
                        >
                          <option>Lead</option>
                          <option>Contacted</option>
                          <option>Proposal</option>
                          <option>Closed Won</option>
                          <option>Closed Lost</option>
                        </select>
                        {statusSaved && (
                          <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-medium animate-fade-in">
                            <CheckSquare size={14} />
                            Status updated
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-cyan-500/20 text-cyan-100 rounded-full text-xs font-medium border border-cyan-500/40"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-cyan-400 text-sm">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cyan-100 uppercase tracking-wide">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 resize-none text-cyan-100 placeholder-cyan-400 transition-all"
                  placeholder="Add notes about this contact..."
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50"
                >
                  <Save size={18} />
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-100 uppercase tracking-wide">Activity Timeline</h3>
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="flex items-center gap-2 gradient-button text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-cyan-500/30"
                >
                  <Plus size={18} />
                  Add Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-cyan-400 mb-4" size={48} />
                  <p className="text-cyan-300 text-lg">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-500/40 flex items-center justify-center text-xl ${activity.color}`}>
                          {activity.icon}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-full bg-cyan-500/20 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="bg-slate-900 p-4 rounded-xl border-2 border-cyan-500/40">
                          <p className="font-bold text-cyan-100 mb-1">{activity.content}</p>
                          <p className="text-xs text-cyan-400">{formatDate(activity.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  {(['all', 'active', 'completed', 'overdue'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                        taskFilter === filter
                          ? 'bg-cyan-500/20 text-cyan-100 border-2 border-cyan-500/40'
                          : 'bg-slate-900 text-cyan-400 border-2 border-cyan-500/20 hover:border-cyan-500/40'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskModal(true);
                  }}
                  className="flex items-center gap-2 gradient-button text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-cyan-500/30"
                >
                  <Plus size={18} />
                  New Task
                </button>
              </div>

              {getFilteredTasks().length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="mx-auto text-cyan-400 mb-4" size={48} />
                  <p className="text-cyan-300 text-lg">No tasks found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredTasks().map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        task.completed
                          ? 'bg-slate-900/50 border-cyan-500/20 opacity-60'
                          : isTaskOverdue(task)
                          ? 'bg-red-500/10 border-red-500/40'
                          : 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="mt-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {task.completed ? (
                            <CheckSquare size={20} className="text-green-400" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-cyan-400 rounded"></div>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                            <h4 className={`font-bold ${task.completed ? 'line-through text-cyan-500' : 'text-cyan-100'}`}>
                              {task.title}
                            </h4>
                            {isTaskOverdue(task) && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full text-xs font-bold">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-cyan-300 mb-2">{task.description}</p>
                          )}
                          <p className="text-xs text-cyan-400">Due: {formatDateShort(task.due_date)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setShowTaskModal(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task?')) {
                                handleDeleteTask(task.id);
                              }
                            }}
                            className="text-cyan-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="text-center py-12">
              <Folder className="mx-auto text-cyan-400 mb-4" size={48} />
              <p className="text-cyan-300 text-lg mb-2">File attachments coming soon</p>
              <p className="text-cyan-500 text-sm">Upload and manage files related to this contact</p>
            </div>
          )}
        </div>
      </div>

      {showActivityModal && <ActivityModal />}
      {showTaskModal && <TaskModal />}
    </div>
  );

  function ActivityModal() {
    const [activityType, setActivityType] = useState('email');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!description.trim()) return;

      setSaving(true);

      await supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: activityType,
        content: description,
      });

      setShowActivityModal(false);
      loadActivities();
      onUpdate();
      setSaving(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border-2 border-cyan-500/40">
          <div className="gradient-cosmic p-6 border-b border-cyan-500/30">
            <h3 className="text-2xl font-bold text-cyan-100">Add Activity</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-cyan-100 mb-2">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-cyan-100"
              >
                <option value="email">Email Sent</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="call">Phone Call</option>
                <option value="note">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-cyan-100 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 resize-none text-cyan-100 placeholder-cyan-400"
                placeholder="Describe the activity..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !description.trim()}
                className="flex-1 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Activity'}
              </button>
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-6 py-3 bg-slate-800 border-2 border-cyan-500/40 text-cyan-100 rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function TaskModal() {
    const [taskData, setTaskData] = useState({
      title: editingTask?.title || '',
      description: editingTask?.description || '',
      due_date: editingTask?.due_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      priority: editingTask?.priority || 'medium',
      completed: editingTask?.completed || false,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!taskData.title.trim()) return;

      setSaving(true);

      if (editingTask) {
        await supabase
          .from('tasks')
          .update({ ...taskData, updated_at: new Date().toISOString() })
          .eq('id', editingTask.id);
      } else {
        await supabase.from('tasks').insert({
          contact_id: contact.id,
          ...taskData,
        });

        await supabase.from('contact_activities').insert({
          contact_id: contact.id,
          activity_type: 'note',
          content: `Task created: ${taskData.title}`,
        });
      }

      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
      loadActivities();
      onUpdate();
      setSaving(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border-2 border-cyan-500/40">
          <div className="gradient-cosmic p-6 border-b border-cyan-500/30">
            <h3 className="text-2xl font-bold text-cyan-100">{editingTask ? 'Edit Task' : 'New Task'}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-cyan-100 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-cyan-100 placeholder-cyan-400"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cyan-100 mb-2">Description</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 resize-none text-cyan-100 placeholder-cyan-400"
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-cyan-100 mb-2">Due Date</label>
                <input
                  type="date"
                  value={taskData.due_date}
                  onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-cyan-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-cyan-100 mb-2">Priority</label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 text-cyan-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {editingTask && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={taskData.completed}
                  onChange={(e) => setTaskData({ ...taskData, completed: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-cyan-500/40 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
                <label htmlFor="completed" className="text-cyan-100 font-medium">
                  Mark as completed
                </label>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !taskData.title.trim()}
                className="flex-1 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                }}
                className="px-6 py-3 bg-slate-800 border-2 border-cyan-500/40 text-cyan-100 rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
