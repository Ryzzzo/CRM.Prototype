import { useEffect, useState } from 'react';
import { Users, TrendingUp, FileText, CheckCircle, Plus, Sparkles, Calendar, Activity, DollarSign } from 'lucide-react';
import { supabase, Contact, ContactActivity, Task } from '../lib/supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

interface DashboardProps {
  onAddContact: () => void;
  onFilterByStatus: (status: string) => void;
  onViewContact?: (contact: Contact) => void;
}

interface Stats {
  total: number;
  newLeads: number;
  contacted: number;
  proposals: number;
  closedWon: number;
  tasksThisWeek: number;
  recentActivity: number;
}

export default function EnhancedDashboard({ onAddContact, onFilterByStatus, onViewContact }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    newLeads: 0,
    contacted: 0,
    proposals: 0,
    closedWon: 0,
    tasksThisWeek: 0,
    recentActivity: 0,
  });
  const [recentActivities, setRecentActivities] = useState<(ContactActivity & { contact?: Contact })[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactGrowth, setContactGrowth] = useState<number[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState({ high: 0, medium: 0, low: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: contacts } = await supabase.from('contacts').select('*, created_at');

    if (contacts) {
      const newStats = {
        total: contacts.length,
        newLeads: contacts.filter(c => c.status === 'Lead').length,
        contacted: contacts.filter(c => c.status === 'Contacted').length,
        proposals: contacts.filter(c => c.status === 'Proposal').length,
        closedWon: contacts.filter(c => c.status === 'Closed Won').length,
        tasksThisWeek: 0,
        recentActivity: 0,
      };

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return contacts.filter(c => {
          const createdDate = new Date(c.created_at);
          return createdDate.toDateString() === date.toDateString();
        }).length;
      });

      const cumulativeGrowth = last30Days.reduce((acc, curr, idx) => {
        const prev = idx > 0 ? acc[idx - 1] : contacts.length - last30Days.reduce((a, b) => a + b, 0);
        acc.push(prev + curr);
        return acc;
      }, [] as number[]);

      setContactGrowth(cumulativeGrowth);
      setStats(newStats);
    }

    const { data: tasks } = await supabase.from('tasks').select('*, due_date, priority, completed');

    if (tasks) {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const tasksThisWeek = tasks.filter(t => {
        const dueDate = new Date(t.due_date);
        return !t.completed && dueDate >= now && dueDate <= weekFromNow;
      }).length;

      const priorityCounts = {
        high: tasks.filter(t => !t.completed && t.priority === 'high').length,
        medium: tasks.filter(t => !t.completed && t.priority === 'medium').length,
        low: tasks.filter(t => !t.completed && t.priority === 'low').length,
      };

      setTasksByPriority(priorityCounts);
      setStats(prev => ({ ...prev, tasksThisWeek }));
    }

    const { data: activities } = await supabase
      .from('contact_activities')
      .select('*, contacts(id, full_name, company)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activities) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivityCount = activities.filter(a => new Date(a.created_at) >= sevenDaysAgo).length;

      const formattedActivities = activities.map(activity => ({
        ...activity,
        contact: activity.contacts as unknown as Contact,
      }));

      setRecentActivities(formattedActivities);
      setStats(prev => ({ ...prev, recentActivity: recentActivityCount }));
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: ContactActivity & { contact?: Contact }) => {
    if (activity.contact && onViewContact) {
      onViewContact(activity.contact as Contact);
    }
  };

  const lineChartData = {
    labels: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.getDate().toString();
    }),
    datasets: [
      {
        label: 'Total Contacts',
        data: contactGrowth,
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['Lead', 'Contacted', 'Proposal', 'Closed Won'],
    datasets: [
      {
        data: [stats.newLeads, stats.contacted, stats.proposals, stats.closedWon],
        backgroundColor: [
          'rgba(34, 211, 238, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(34, 211, 238)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [tasksByPriority.high, tasksByPriority.medium, tasksByPriority.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 211, 238, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 211, 238)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(165, 243, 252)',
        },
      },
    },
    scales: {
      y: {
        ticks: { color: 'rgb(165, 243, 252)' },
        grid: { color: 'rgba(34, 211, 238, 0.1)' },
      },
      x: {
        ticks: { color: 'rgb(165, 243, 252)' },
        grid: { color: 'rgba(34, 211, 238, 0.1)' },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(165, 243, 252)',
          padding: 15,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 skeleton rounded-lg"></div>
          <div className="h-10 w-36 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 skeleton rounded-xl lg:col-span-2"></div>
          <div className="h-80 skeleton rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-cyan-100 mt-1">Welcome back! Here's your CRM overview</p>
        </div>
        <button
          onClick={onAddContact}
          className="flex items-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gradient-teal-cyan p-6 rounded-xl shadow-lg shadow-cyan-500/30 card-hover border border-cyan-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-100 font-medium">Total Contacts</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        <button
          onClick={() => onFilterByStatus('Lead')}
          className="bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-cyan-500/40 card-hover text-left transition-all hover:scale-105 hover:border-cyan-400"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300 font-medium">Active Leads</p>
              <p className="text-4xl font-bold text-cyan-100 mt-2">{stats.newLeads}</p>
            </div>
            <div className="bg-cyan-400 bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="text-cyan-400" size={28} />
            </div>
          </div>
        </button>

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-teal-500/40 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300 font-medium">Tasks This Week</p>
              <p className="text-4xl font-bold text-cyan-100 mt-2">{stats.tasksThisWeek}</p>
            </div>
            <div className="bg-teal-400 bg-opacity-20 p-3 rounded-lg">
              <Calendar className="text-teal-400" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-emerald-500/40 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300 font-medium">Recent Activity</p>
              <p className="text-4xl font-bold text-cyan-100 mt-2">{stats.recentActivity}</p>
              <p className="text-xs text-cyan-400 mt-1">Last 7 days</p>
            </div>
            <div className="bg-emerald-400 bg-opacity-20 p-3 rounded-lg">
              <Activity className="text-emerald-400" size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-xl border-2 border-cyan-500/40">
          <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={20} />
            Contact Growth (Last 30 Days)
          </h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border-2 border-cyan-500/40">
          <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
            <Users className="text-cyan-400" size={20} />
            Contacts by Status
          </h3>
          <div className="h-64">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border-2 border-cyan-500/40">
          <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
            <CheckCircle className="text-cyan-400" size={20} />
            Tasks by Priority
          </h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-xl border-2 border-cyan-500/40">
          <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            Recent Activity Feed
          </h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-cyan-400/50 mb-3" size={48} />
              <p className="text-cyan-300">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-cyan-500/20 hover:bg-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-cyan-500/50 group-hover:scale-150 transition-transform"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cyan-100">
                      <span className="font-bold text-cyan-200 hover:text-cyan-100">{activity.contact?.full_name || 'Unknown'}</span>
                      {activity.contact?.company && <span className="text-cyan-300"> from {activity.contact.company}</span>}
                    </p>
                    <p className="text-sm text-cyan-400 mt-1">{activity.content}</p>
                    <p className="text-xs text-cyan-500 mt-1 font-medium">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 via-teal-900 to-slate-800 p-8 rounded-2xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-cyan-400" size={24} />
          <h2 className="text-2xl font-bold text-cyan-100">Pipeline Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => onFilterByStatus('Lead')}
            className="bg-slate-900 rounded-xl p-5 border-l-4 border-cyan-400 shadow-lg hover:shadow-cyan-500/30 card-hover text-left transition-all hover:scale-105"
          >
            <p className="text-sm font-medium text-cyan-300 mb-2">New Leads</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{stats.newLeads}</p>
          </button>
          <button
            onClick={() => onFilterByStatus('Contacted')}
            className="bg-slate-900 rounded-xl p-5 border-l-4 border-blue-400 shadow-lg hover:shadow-blue-500/30 card-hover text-left transition-all hover:scale-105"
          >
            <p className="text-sm font-medium text-cyan-300 mb-2">Contacted</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.contacted}</p>
          </button>
          <button
            onClick={() => onFilterByStatus('Proposal')}
            className="bg-slate-900 rounded-xl p-5 border-l-4 border-teal-400 shadow-lg hover:shadow-teal-500/30 card-hover text-left transition-all hover:scale-105"
          >
            <p className="text-sm font-medium text-cyan-300 mb-2">Proposals</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{stats.proposals}</p>
          </button>
          <button
            onClick={() => onFilterByStatus('Closed Won')}
            className="bg-slate-900 rounded-xl p-5 border-l-4 border-emerald-400 shadow-lg hover:shadow-emerald-500/30 card-hover text-left transition-all hover:scale-105"
          >
            <p className="text-sm font-medium text-cyan-300 mb-2">Closed Won</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{stats.closedWon}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
