
import React, { useState, useMemo } from 'react';
import { Medicine, MedicineCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface MedicineListProps {
  medicines: Medicine[];
  onEdit: (med: Medicine) => void;
  onDelete: (id: string) => void;
  onView: (med: Medicine) => void;
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines, onEdit, onDelete, onView }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MedicineCategory | 'All'>('All');

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                            m.brand.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || m.category === filter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [medicines, search, filter]);

  const getExpiryStatus = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    if (diffDays < 90) return { label: `${diffDays} days left`, color: 'bg-orange-100 text-orange-700' };
    return { label: 'Stable', color: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search medicine name or brand..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="All">All Categories</option>
          {Object.values(MedicineCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map(med => {
            const expiryStatus = getExpiryStatus(med.expiryDate);
            return (
              <div 
                key={med.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[med.category]}`}>
                        {med.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 mt-1">{med.name}</h3>
                      <p className="text-sm text-slate-500">{med.brand}</p>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => onEdit(med)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">✏️</button>
                       <button onClick={() => onDelete(med.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Stock:</span>
                      <span className={`font-semibold ${med.quantity <= 2 ? 'text-red-600' : 'text-slate-700'}`}>
                        {med.quantity} {med.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Expiry:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${expiryStatus.color}`}>
                        {expiryStatus.label} ({new Date(med.expiryDate).toLocaleDateString()})
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onView(med)}
                    className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            No medicines found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineList;
