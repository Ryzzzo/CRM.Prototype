import { Mail, Calendar, FileText, CheckSquare } from 'lucide-react';

interface QuickActionsBarProps {
  onSendEmail: () => void;
  onScheduleMeeting: () => void;
  onAddNote: () => void;
  onCreateTask: () => void;
}

export default function QuickActionsBar({
  onSendEmail,
  onScheduleMeeting,
  onAddNote,
  onCreateTask,
}: QuickActionsBarProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg">
      <h3 className="text-white font-semibold mb-3 text-sm">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={onSendEmail}
          className="flex flex-col items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-lg transition-all hover:scale-105"
        >
          <Mail size={20} />
          <span className="text-xs font-medium">Send Email</span>
        </button>
        <button
          onClick={onScheduleMeeting}
          className="flex flex-col items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-lg transition-all hover:scale-105"
        >
          <Calendar size={20} />
          <span className="text-xs font-medium">Schedule Meeting</span>
        </button>
        <button
          onClick={onAddNote}
          className="flex flex-col items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-lg transition-all hover:scale-105"
        >
          <FileText size={20} />
          <span className="text-xs font-medium">Add Note</span>
        </button>
        <button
          onClick={onCreateTask}
          className="flex flex-col items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-lg transition-all hover:scale-105"
        >
          <CheckSquare size={20} />
          <span className="text-xs font-medium">Create Task</span>
        </button>
      </div>
    </div>
  );
}
