import { useState } from 'react';
import { LayoutDashboard, Users } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContactsPage from './components/ContactsPage';
import ContactDetailModal from './components/ContactDetailModal';
import ContactForm from './components/ContactForm';
import { Contact } from './lib/supabase';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'contacts';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setSelectedContact(null);
  };

  const handleDelete = async (contact: Contact) => {
    await supabase.from('contacts').delete().eq('id', contact.id);
    setSelectedContact(null);
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

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <nav className="gradient-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <LayoutDashboard size={24} />
                </div>
                CRM System
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === 'contacts'
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <Users size={20} />
                Contacts
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard key={`dashboard-${refreshKey}`} onAddContact={handleAddContact} />
        )}
        {currentView === 'contacts' && (
          <ContactsPage key={`contacts-${refreshKey}`} onViewContact={handleViewContact} />
        )}
      </main>

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={handleCloseDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

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
