import { Edit2, Trash2, User, Clock } from 'lucide-react';
import { Deal, Contact } from '../lib/supabase';

interface DealCardProps {
  deal: Deal & { contact?: Contact };
  onDragStart: (dealId: string) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
  onViewContact?: (contact: Contact) => void;
  formatCurrency: (amount: number) => string;
}

export default function DealCard({ deal, onDragStart, onEdit, onDelete, onViewContact, formatCurrency }: DealCardProps) {
  const getDaysInStage = () => {
    const created = new Date(deal.updated_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = () => {
    if (deal.probability >= 75) return 'border-green-400';
    if (deal.probability >= 50) return 'border-cyan-400';
    if (deal.probability >= 25) return 'border-amber-400';
    return 'border-red-400';
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal.id)}
      className={`bg-slate-800 p-3 rounded-lg border-l-4 ${getPriorityColor()} cursor-move hover:shadow-lg hover:shadow-cyan-500/20 transition-all group`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-cyan-100 text-xs lg:text-sm leading-tight pr-2 line-clamp-2">
          {deal.name}
        </h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-all"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal.id);
            }}
            className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          {formatCurrency(Number(deal.value))}
        </p>
      </div>

      {deal.contact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewContact) onViewContact(deal.contact as Contact);
          }}
          className="flex items-center gap-1.5 mb-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors w-full"
        >
          <User size={12} />
          <span className="truncate">{deal.contact.full_name}</span>
        </button>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-cyan-500">
          <Clock size={11} />
          <span className="text-[10px] lg:text-xs">{getDaysInStage()}d</span>
        </div>
        <div className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] lg:text-xs ${
          deal.probability >= 75 ? 'bg-green-500/20 text-green-400' :
          deal.probability >= 50 ? 'bg-cyan-500/20 text-cyan-400' :
          deal.probability >= 25 ? 'bg-amber-500/20 text-amber-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {deal.probability}%
        </div>
      </div>
    </div>
  );
}
