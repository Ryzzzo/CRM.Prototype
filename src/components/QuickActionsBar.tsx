import { Mail, Phone, Calendar, FileText, CheckSquare } from 'lucide-react';

interface QuickActionsBarProps {
  onSendEmail: () => void;
  onAddActivity: () => void;
  onAddTask: () => void;
  contactPhone?: string;
}

export default function QuickActionsBar({
  onSendEmail,
  onAddActivity,
  onAddTask,
  contactPhone,
}: QuickActionsBarProps) {
  return (
    <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-cyan-100 uppercase tracking-wide">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={onSendEmail}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-teal-500/20 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 transition-all group"
        >
          <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
            <Mail className="text-cyan-400" size={24} />
          </div>
          <span className="text-sm font-medium text-cyan-100">Send Email</span>
        </button>

        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-gradient-to-br hover:from-green-500/20 hover:to-emerald-500/20 rounded-xl border-2 border-cyan-500/30 hover:border-green-400 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-all">
              <Phone className="text-green-400" size={24} />
            </div>
            <span className="text-sm font-medium text-cyan-100">Call</span>
          </a>
        )}

        <button
          onClick={onAddTask}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl border-2 border-cyan-500/30 hover:border-purple-400 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
            <CheckSquare className="text-purple-400" size={24} />
          </div>
          <span className="text-sm font-medium text-cyan-100">Add Task</span>
        </button>

        <button
          onClick={onAddActivity}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 rounded-xl border-2 border-cyan-500/30 hover:border-blue-400 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
            <FileText className="text-blue-400" size={24} />
          </div>
          <span className="text-sm font-medium text-cyan-100">Log Activity</span>
        </button>
      </div>
    </div>
  );
}
