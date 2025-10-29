import { useEffect, useState } from 'react';
import { Users, TrendingUp, FileText, CheckCircle, Plus, Sparkles } from 'lucide-react';
import { supabase, Contact, ContactActivity } from '../lib/supabase';

interface DashboardProps {
  onAddContact: () => void;
}

interface Stats {
  total: number;
  newLeads: number;
  contacted: number;
  proposals: number;
  closedWon: number;
}

export default function Dashboard({ onAddContact }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    newLeads: 0,
    contacted: 0,
    proposals: 0,
    closedWon: 0,
  });
  const [recentActivities, setRecentActivities] = useState<(ContactActivity & { contact?: Contact })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: contacts } = await supabase
      .from('contacts')
      .select('*');

    if (contacts) {
      const newStats = {
        total: contacts.length,
        newLeads: contacts.filter(c => c.status === 'Lead').length,
        contacted: contacts.filter(c => c.status === 'Contacted').length,
        proposals: contacts.filter(c => c.status === 'Proposal').length,
        closedWon: contacts.filter(c => c.status === 'Closed Won').length,
      };
      setStats(newStats);
    }

    const { data: activities } = await supabase
      .from('contact_activities')
      .select('*, contacts(full_name, company)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activities) {
      const formattedActivities = activities.map(activity => ({
        ...activity,
        contact: activity.contacts as unknown as Contact,
      }));
      setRecentActivities(formattedActivities);
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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 skeleton rounded-lg"></div>
          <div className="h-10 w-36 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 skeleton rounded-xl"></div>
        <div className="h-96 skeleton rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your CRM overview</p>
        </div>
        <button
          onClick={onAddContact}
          className="flex items-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg card-hover text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100">Total Contacts</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newLeads}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="text-yellow-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacted</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.contacted}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proposals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.proposals}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="text-purple-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg card-hover text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Closed Won</p>
              <p className="text-3xl font-bold mt-2">{stats.closedWon}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-indigo-200 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-md card-hover">
            <p className="text-sm font-medium text-gray-600 mb-2">New Leads</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.newLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-md card-hover">
            <p className="text-sm font-medium text-gray-600 mb-2">Contacted</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.contacted}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-md card-hover">
            <p className="text-sm font-medium text-gray-600 mb-2">Proposals</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.proposals}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-md card-hover">
            <p className="text-sm font-medium text-gray-600 mb-2">Closed Won</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.closedWon}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b-2 border-gray-100 last:border-0 hover:bg-gray-50 -mx-4 px-4 py-3 rounded-lg transition-all">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-bold">{activity.contact?.full_name || 'Unknown'}</span>
                    {activity.contact?.company && <span className="text-gray-600"> from {activity.contact.company}</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{formatDate(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
