import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, Target, Award } from 'lucide-react';
import { supabase, Deal, Contact } from '../lib/supabase';
import DealCard from './DealCard';
import DealModal from './DealModal';

interface DealsPageProps {
  onViewContact?: (contact: Contact) => void;
}

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;

export default function DealsPage({ onViewContact }: DealsPageProps) {
  const [deals, setDeals] = useState<(Deal & { contact?: Contact })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('deals')
      .select('*, contacts(id, full_name, company, email)')
      .order('created_at', { ascending: false });

    if (data) {
      const formattedDeals = data.map(deal => ({
        ...deal,
        contact: deal.contacts as unknown as Contact,
      }));
      setDeals(formattedDeals);
    }
    setLoading(false);
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: typeof STAGES[number]) => {
    if (!draggedDeal) return;

    const deal = deals.find(d => d.id === draggedDeal);
    if (!deal || deal.stage === stage) {
      setDraggedDeal(null);
      return;
    }

    await supabase
      .from('deals')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', draggedDeal);

    await supabase.from('contact_activities').insert({
      contact_id: deal.contact_id,
      activity_type: 'status_change',
      content: `Deal "${deal.name}" moved from ${deal.stage} to ${stage}`,
    });

    setDraggedDeal(null);
    loadDeals();
  };

  const getStageDeals = (stage: typeof STAGES[number]) => {
    return deals.filter(d => d.stage === stage);
  };

  const getStageValue = (stage: typeof STAGES[number]) => {
    return getStageDeals(stage).reduce((sum, deal) => sum + Number(deal.value), 0);
  };

  const getTotalPipelineValue = () => {
    return deals
      .filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage))
      .reduce((sum, deal) => sum + Number(deal.value), 0);
  };

  const getWeightedPipelineValue = () => {
    return deals
      .filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage))
      .reduce((sum, deal) => sum + (Number(deal.value) * deal.probability / 100), 0);
  };

  const getWinRate = () => {
    const closed = deals.filter(d => ['Closed Won', 'Closed Lost'].includes(d.stage));
    if (closed.length === 0) return 0;
    const won = closed.filter(d => d.stage === 'Closed Won');
    return (won.length / closed.length) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage: typeof STAGES[number]) => {
    switch (stage) {
      case 'Lead': return 'border-cyan-400';
      case 'Qualified': return 'border-blue-400';
      case 'Proposal': return 'border-purple-400';
      case 'Negotiation': return 'border-teal-400';
      case 'Closed Won': return 'border-green-400';
      case 'Closed Lost': return 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 skeleton rounded-xl"></div>
        <div className="h-96 skeleton rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Deal Pipeline
          </h1>
          <p className="text-cyan-100 mt-1">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => {
            setEditingDeal(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 gradient-button text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/50"
        >
          <Plus size={20} />
          New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border-2 border-cyan-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-300 font-medium">Total Pipeline</p>
            <DollarSign className="text-cyan-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-cyan-100">{formatCurrency(getTotalPipelineValue())}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border-2 border-teal-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-300 font-medium">Weighted Value</p>
            <Target className="text-teal-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-cyan-100">{formatCurrency(getWeightedPipelineValue())}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-300 font-medium">Active Deals</p>
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-cyan-100">{deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border-2 border-green-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-300 font-medium">Win Rate</p>
            <Award className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-cyan-100">{getWinRate().toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-slate-800 p-4 lg:p-6 rounded-2xl border-2 border-cyan-500/40 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
          {STAGES.map(stage => (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
              className={`bg-slate-900 rounded-xl border-2 ${getStageColor(stage)} p-3`}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-cyan-100 text-sm lg:text-base truncate pr-2">{stage}</h3>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    {getStageDeals(stage).length}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-cyan-400 font-medium truncate">
                  {formatCurrency(getStageValue(stage))}
                </p>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-450px)] min-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {getStageDeals(stage).length === 0 ? (
                  <div className="text-center py-8 text-cyan-500 text-xs">
                    No deals in this stage
                  </div>
                ) : (
                  getStageDeals(stage).map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onDragStart={handleDragStart}
                      onEdit={(deal) => {
                        setEditingDeal(deal);
                        setShowModal(true);
                      }}
                      onDelete={async (dealId) => {
                        if (confirm('Are you sure you want to delete this deal?')) {
                          await supabase.from('deals').delete().eq('id', dealId);
                          loadDeals();
                        }
                      }}
                      onViewContact={onViewContact}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <DealModal
          deal={editingDeal}
          onClose={() => {
            setShowModal(false);
            setEditingDeal(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingDeal(null);
            loadDeals();
          }}
        />
      )}
    </div>
  );
}
