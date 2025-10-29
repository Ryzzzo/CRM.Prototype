import { useState, useEffect } from 'react';
import { Plus, Pin, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, Note } from '../lib/supabase';

interface NotesSectionProps {
  contactId: string;
  onUpdate: () => void;
}

export default function NotesSection({ contactId, onUpdate }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, [contactId]);

  const loadNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setNotes(data);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNoteContent.trim()) return;

    const { error } = await supabase.from('notes').insert({
      contact_id: contactId,
      content: newNoteContent,
    });

    if (!error) {
      setNewNoteContent('');
      setShowAddForm(false);
      loadNotes();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: 'Note added',
      });
    }
  };

  const handleTogglePin = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .update({
        pinned: !note.pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id);

    if (!error) {
      loadNotes();
      onUpdate();
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('notes')
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId);

    if (!error) {
      setEditingNote(null);
      setEditContent('');
      loadNotes();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: 'Note updated',
      });
    }
  };

  const handleDeleteNote = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note.id);

    if (!error) {
      loadNotes();
      onUpdate();

      await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'note',
        content: 'Note deleted',
      });
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

  const formatTextStyle = (text: string, style: 'bold' | 'italic') => {
    const marker = style === 'bold' ? '**' : '*';
    const selection = window.getSelection()?.toString() || '';
    if (selection) {
      return text.replace(selection, `${marker}${selection}${marker}`);
    }
    return text + marker + marker;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm gradient-button text-white px-3 py-1.5 rounded-lg"
        >
          <Plus size={16} />
          Add Note
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNote} className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="space-y-3">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setNewNoteContent(formatTextStyle(newNoteContent, 'bold'))}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white transition-colors font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => setNewNoteContent(formatTextStyle(newNoteContent, 'italic'))}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white transition-colors italic"
                title="Italic"
              >
                I
              </button>
            </div>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here... (Use **text** for bold, *text* for italic)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="gradient-button text-white px-4 py-2 rounded-lg"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewNoteContent('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                note.pinned
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                  : 'bg-white border-gray-200 card-hover'
              }`}
            >
              {editingNote === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="flex items-center gap-1 gradient-button text-white px-3 py-1.5 rounded-lg text-sm"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNote(null);
                        setEditContent('');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-gray-900 flex-1 whitespace-pre-wrap break-words">
                      {note.content.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        } else if (part.startsWith('*') && part.endsWith('*')) {
                          return <em key={i}>{part.slice(1, -1)}</em>;
                        }
                        return part;
                      })}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.pinned
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={note.pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={16} className={note.pinned ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(note.id);
                          setEditContent(note.content);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this note?')) {
                            handleDeleteNote(note);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {note.pinned && (
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">
                        Pinned
                      </span>
                    )}
                    <span>{formatDate(note.created_at)}</span>
                    {note.updated_at !== note.created_at && (
                      <span className="text-gray-400">(edited)</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
