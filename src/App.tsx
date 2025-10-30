import { useState } from 'react';
import { LayoutDashboard, Users, DollarSign } from 'lucide-react';
import EnhancedDashboard from './components/EnhancedDashboard';
import ContactsPage from './components/ContactsPage';
import ContactDetailPage from './components/ContactDetailPage';
import ContactForm from './components/ContactForm';
import GlobalSearch from './components/GlobalSearch';
import DealsPage from './components/DealsPage';
import { Contact } from './lib/supabase';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'contacts' | 'contact-detail' | 'deals';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView('contact-detail');
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
    setCurrentView('contacts');
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleDelete = async (contact: Contact) => {
    await supabase.from('contacts').delete().eq('id', contact.id);
    setSelectedContact(null);
    setCurrentView('contacts');
    setRefreshKey(prev => prev + 1);
  };

  const handleSaveForm = () => {
    setShowAddForm(false);
    setEditingContact(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleAddContact = () => {
    setShowAddForm(true);
  };

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
    setCurrentView('contacts');
  };

  const handleNavigateToContacts = () => {
    setStatusFilter('All');
    setCurrentView('contacts');
  };

  const handleNavigateToContactsWithTasks = () => {
    setStatusFilter('HasTasks');
    setCurrentView('contacts');
  };

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <nav className="gradient-cosmic shadow-2xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan-400 bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                  <LayoutDashboard size={24} className="text-cyan-300" />
                </div>
                CRM System
              </h1>
            </div>
            <div className="flex-1 max-w-xl hidden md:block">
              <GlobalSearch onSelectContact={handleViewContact} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-cyan-400 text-teal-900 shadow-lg shadow-cyan-500/50'
                    : 'text-cyan-100 hover:bg-cyan-400 hover:bg-opacity-20 border border-cyan-400/30'
                }`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'contacts' || currentView === 'contact-detail'
                    ? 'bg-cyan-400 text-teal-900 shadow-lg shadow-cyan-500/50'
                    : 'text-cyan-100 hover:bg-cyan-400 hover:bg-opacity-20 border border-cyan-400/30'
                }`}
              >
                <Users size={20} />
                Contacts
              </button>
              <button
                onClick={() => setCurrentView('deals')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'deals'
                    ? 'bg-cyan-400 text-teal-900 shadow-lg shadow-cyan-500/50'
                    : 'text-cyan-100 hover:bg-cyan-400 hover:bg-opacity-20 border border-cyan-400/30'
                }`}
              >
                <DollarSign size={20} />
                Deals
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <EnhancedDashboard key={`dashboard-${refreshKey}`} onAddContact={handleAddContact} onFilterByStatus={handleFilterByStatus} onViewContact={handleViewContact} onNavigateToContacts={handleNavigateToContacts} onNavigateToContactsWithTasks={handleNavigateToContactsWithTasks} />
        )}
        {currentView === 'contacts' && (
          <ContactsPage key={`contacts-${refreshKey}`} onViewContact={handleViewContact} initialStatusFilter={statusFilter} />
        )}
        {currentView === 'contact-detail' && selectedContact && (
          <ContactDetailPage
            key={`contact-detail-${selectedContact.id}-${refreshKey}`}
            contact={selectedContact}
            onBack={handleCloseDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
        {currentView === 'deals' && (
          <DealsPage key={`deals-${refreshKey}`} onViewContact={handleViewContact} />
        )}
      </main>

      {(showAddForm || editingContact) && (
        <ContactForm
          contact={editingContact}
          onClose={() => {
            setShowAddForm(false);
            setEditingContact(null);
          }}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
}

export default App;
