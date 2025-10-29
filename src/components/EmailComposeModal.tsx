import { useState, useEffect } from 'react';
import { X, Send, Mail, FileText } from 'lucide-react';
import { supabase, Contact, EmailTemplate } from '../lib/supabase';

interface EmailComposeModalProps {
  contact: Contact;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailComposeModal({ contact, onClose, onSent }: EmailComposeModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [to, setTo] = useState(contact.email);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('is_default', { ascending: false });

    if (data) {
      setTemplates(data as EmailTemplate[]);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let emailSubject = template.subject;
    let emailBody = template.body;

    emailSubject = emailSubject
      .replace(/\{\{contact_name\}\}/g, contact.full_name)
      .replace(/\{\{company_name\}\}/g, contact.company || 'your company')
      .replace(/\{\{your_name\}\}/g, 'Your Name');

    emailBody = emailBody
      .replace(/\{\{contact_name\}\}/g, contact.full_name)
      .replace(/\{\{company_name\}\}/g, contact.company || 'your company')
      .replace(/\{\{your_name\}\}/g, 'Your Name');

    setSubject(emailSubject);
    setBody(emailBody);
    setSelectedTemplate(templateId);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);

    const mailtoLink = `mailto:${to}${cc ? `?cc=${cc}` : ''}${bcc ? `${cc ? '&' : '?'}bcc=${bcc}` : ''}${subject ? `${cc || bcc ? '&' : '?'}subject=${encodeURIComponent(subject)}` : ''}${body ? `${cc || bcc || subject ? '&' : '?'}body=${encodeURIComponent(body)}` : ''}`;

    window.location.href = mailtoLink;

    await supabase.from('contact_activities').insert({
      contact_id: contact.id,
      activity_type: 'email',
      content: `Email sent: ${subject}`,
    });

    setTimeout(() => {
      setSending(false);
      onSent();
    }, 1000);
  };

  const formatText = (formatType: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);

    if (!selectedText) return;

    let formattedText = selectedText;
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }

    const newBody = body.substring(0, start) + formattedText + body.substring(end);
    setBody(newBody);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar border-2 border-cyan-500/40 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex justify-between items-center border-b border-cyan-500/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Mail className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Compose Email</h3>
              <p className="text-cyan-100 text-sm">To: {contact.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              <FileText size={16} className="inline mr-1" />
              Email Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              To <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              placeholder="recipient@example.com"
            />
          </div>

          <div className="flex gap-3">
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                + Add Cc
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                + Add Bcc
              </button>
            )}
          </div>

          {showCc && (
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Cc</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                placeholder="cc@example.com"
              />
            </div>
          )}

          {showBcc && (
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Bcc</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                placeholder="bcc@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500/40 rounded-xl text-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <div className="border-2 border-cyan-500/40 rounded-xl overflow-hidden bg-slate-900">
              <div className="flex gap-2 p-2 border-b border-cyan-500/20 bg-slate-900">
                <button
                  onClick={() => formatText('bold')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-bold transition-all"
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded italic transition-all"
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => formatText('underline')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded underline transition-all"
                  title="Underline"
                >
                  U
                </button>
              </div>
              <textarea
                id="email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-slate-900 text-cyan-100 focus:ring-0 focus:outline-none resize-none placeholder-cyan-400"
                placeholder="Type your message here..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-cyan-100 rounded-xl font-medium hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !to || !subject || !body}
              className="flex-1 flex items-center justify-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-cyan-300">
              <strong className="text-cyan-200">Note:</strong> This will open your default email client with the pre-filled information. The email activity will be logged to the contact's timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
