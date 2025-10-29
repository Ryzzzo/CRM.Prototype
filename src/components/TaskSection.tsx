import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { supabase, Task } from '../lib/supabase';

interface TaskSectionProps {
  contactId: string;
  onUpdate: () => void;
}

export default function TaskSection({ contactId, onUpdate }: TaskSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Task['priority'],
  });

  useEffect(() => {
    loadTasks();
  }, [contactId]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true });

    if (data) {
      setTasks(data);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('tasks').insert({
      contact_id: contactId,
      ...newTask,
    });

    if (!error) {
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
      setShowAddForm(false);
      loadTasks();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: `Task created: ${newTask.title}`,
      });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    if (!error) {
      loadTasks();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: `Task ${task.completed ? 'reopened' : 'completed'}: ${task.title}`,
      });
    }
  };

  const handleDeleteTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);

    if (!error) {
      loadTasks();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: `Task deleted: ${task.title}`,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={14} />;
      case 'medium':
        return <Calendar size={14} />;
      case 'low':
        return <Circle size={14} />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !tasks.find(t => t.due_date === dueDate)?.completed;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm gradient-button text-white px-3 py-1.5 rounded-lg"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTask} className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="space-y-3">
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="gradient-button text-white px-4 py-2 rounded-lg"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No tasks yet</p>
        ) : (
          tasks.map((task) => {
            const overdue = isOverdue(task.due_date) && !task.completed;
            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  task.completed
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : overdue
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 card-hover'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>
                        Due: {formatDate(task.due_date)}
                        {overdue && ' (Overdue)'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        handleDeleteTask(task);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
