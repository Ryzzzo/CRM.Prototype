import { useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Contact } from '../lib/supabase';

interface ContactsPageProps {
  onViewContact: (contact: Contact) => void;
  initialStatusFilter?: string;
}

export default function ContactsPage({ onViewContact, initialStatusFilter = 'All' }: ContactsPageProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.full_name.toLowerCase().includes(term) ||
          contact.company.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal':
        return 'bg-purple-100 text-purple-800';
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 skeleton rounded-lg"></div>
        <div className="h-96 skeleton rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Contacts
        </h1>
        <p className="text-cyan-100 mt-1">Manage your contacts and relationships</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border-2 border-cyan-500/40 shadow-cyan-500/10">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all text-cyan-100 placeholder-cyan-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-cyan-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all font-medium text-cyan-100"
            >
              <option>All</option>
              <option>Lead</option>
              <option>Contacted</option>
              <option>Proposal</option>
              <option>Closed Won</option>
              <option>Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-cyan-500/40 bg-gradient-to-r from-teal-900 to-cyan-900">
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Name</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Company</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Email</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Phone</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Status</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-cyan-100 uppercase tracking-wide">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {currentContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-cyan-400">
                    No contacts found
                  </td>
                </tr>
              ) : (
                currentContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    onClick={() => onViewContact(contact)}
                    className={`border-b border-cyan-500/20 cursor-pointer table-row-hover ${index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'}`}
                  >
                    <td className="py-4 px-4">
                      <p className="font-bold text-cyan-100">{contact.full_name}</p>
                    </td>
                    <td className="py-4 px-4 text-cyan-300">{contact.company || '-'}</td>
                    <td className="py-4 px-4 text-cyan-300">{contact.email || '-'}</td>
                    <td className="py-4 px-4 text-cyan-300">{contact.phone || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-cyan-300">{formatDate(contact.last_contact_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-cyan-500/40">
          <p className="text-sm font-medium text-cyan-200">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border-2 border-cyan-500/40 rounded-xl hover:bg-cyan-400/20 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-cyan-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border-2 border-cyan-500/40 rounded-xl hover:bg-cyan-400/20 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-cyan-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
