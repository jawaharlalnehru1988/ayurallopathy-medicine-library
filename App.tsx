
import React, { useState, useEffect } from 'react';
import { Medicine, MedicineCategory, Disease, DiseaseSeverity } from './types';
import { INITIAL_MEDICINES } from './constants';
import Dashboard from './components/Dashboard';
import MedicineList from './components/MedicineList';
import MedicineForm from './components/MedicineForm';
import DiseaseGuide from './components/DiseaseGuide';
import { medicineApi } from './services/medicineApi';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'diseases'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load medicines from API
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await medicineApi.getAll();
        setMedicines(data);
      } catch (err) {
        console.error('Failed to load medicines:', err);
        setError('Failed to load medicines. Using local data.');
        // Fallback to localStorage if API fails
        const savedMeds = localStorage.getItem('ayur_library_medicines');
        if (savedMeds) {
          setMedicines(JSON.parse(savedMeds));
        } else {
          setMedicines(INITIAL_MEDICINES);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  // Load diseases from local storage (keep existing logic)
  useEffect(() => {
    const savedDiseases = localStorage.getItem('ayur_library_diseases');
    if (savedDiseases) {
      setDiseases(JSON.parse(savedDiseases));
    }
  }, []);

  // Backup medicines to local storage (as fallback)
  useEffect(() => {
    if (medicines.length > 0) {
      localStorage.setItem('ayur_library_medicines', JSON.stringify(medicines));
    }
  }, [medicines]);

  // Save diseases to local storage
  useEffect(() => {
    localStorage.setItem('ayur_library_diseases', JSON.stringify(diseases));
  }, [diseases]);

  const handleAddMedicine = async (newMed: Partial<Medicine>) => {
    try {
      setLoading(true);
      setError(null);
      const created = await medicineApi.create(newMed);
      setMedicines([...medicines, created]);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to add medicine:', err);
      setError('Failed to add medicine. Please try again.');
      // Fallback to local creation
      const med: Medicine = {
        ...newMed,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString(),
      } as Medicine;
      setMedicines([...medicines, med]);
      setIsFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedicine = async (updatedFields: Partial<Medicine>) => {
    if (!editingMedicine) return;
    try {
      setLoading(true);
      setError(null);
      const updated = await medicineApi.update(editingMedicine.id, updatedFields);
      const updatedMedicines = medicines.map(m => 
        m.id === editingMedicine.id ? updated : m
      );
      setMedicines(updatedMedicines);
      setEditingMedicine(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to update medicine:', err);
      setError('Failed to update medicine. Please try again.');
      // Fallback to local update
      const updatedMedicines = medicines.map(m => 
        m.id === editingMedicine.id ? { ...m, ...updatedFields, lastUpdated: new Date().toISOString() } : m
      );
      setMedicines(updatedMedicines);
      setEditingMedicine(null);
      setIsFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await medicineApi.delete(id);
      setMedicines(medicines.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      setError('Failed to delete medicine. Please try again.');
      // Fallback to local deletion
      setMedicines(medicines.filter(m => m.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleAddDisease = (newDisease: Partial<Disease>) => {
    const disease: Disease = {
      ...newDisease,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
    } as Disease;
    setDiseases([...diseases, disease]);
  };

  const handleUpdateDisease = (updated: Partial<Disease>) => {
    setDiseases(diseases.map(d => d.id === updated.id ? { ...d, ...updated, lastUpdated: new Date().toISOString() } : d));
  };

  const handleDeleteDisease = (id: string) => {
    if (window.confirm('Delete this disease registry record?')) {
      setDiseases(diseases.filter(d => d.id !== id));
    }
  };

  const handleEditClick = (med: Medicine) => {
    setEditingMedicine(med);
    setIsFormOpen(true);
  };

  const getExpiryLabel = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Expired', color: 'text-red-600 bg-red-50' };
    if (diffDays < 90) return { text: `Expiring in ${diffDays}d`, color: 'text-orange-600 bg-orange-50' };
    return { text: `Safe (${new Date(dateStr).toLocaleDateString()})`, color: 'text-emerald-600 bg-emerald-50' };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200">
              🌿
            </div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">AyurAllopathy<br/><span className="text-slate-400 text-sm font-normal">Library System</span></h1>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📚 Med Library
            </button>
            <button
              onClick={() => setActiveTab('diseases')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'diseases' ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              🧠 Condition Registry
            </button>
          </div>

          <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Inventory Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items</span>
                <span className="font-bold text-slate-700">{medicines.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Chronic Conds.</span>
                <span className="font-bold text-rose-500">{diseases.filter(d => d.severity === DiseaseSeverity.CHRONIC).length}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 capitalize">
              {activeTab === 'diseases' ? 'Disease Registry' : activeTab}
            </h2>
            <p className="text-slate-500 mt-1">
              {activeTab === 'diseases' ? 'Manage clinical records and diagnostic methods' : 'Manage your practitioner medicine inventory'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditingMedicine(null); setIsFormOpen(true); }}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <span>➕</span> Add Medicine
            </button>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading medicines...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-600">⚠️</span>
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && <Dashboard medicines={medicines} />}
            
            {activeTab === 'library' && (
              <MedicineList 
                medicines={medicines} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteMedicine}
                onView={(med) => setViewingMedicine(med)}
              />
            )}

            {activeTab === 'diseases' && (
              <DiseaseGuide 
                diseases={diseases}
                onAdd={handleAddDisease}
                onUpdate={handleUpdateDisease}
                onDelete={handleDeleteDisease}
              />
            )}
          </>
        )}

        {/* Modal Overlay for Form */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl">
              <MedicineForm 
                initialData={editingMedicine}
                onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
                onCancel={() => { setIsFormOpen(false); setEditingMedicine(null); }}
              />
            </div>
          </div>
        )}

        {/* Medicine Detail View Modal */}
        {viewingMedicine && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 my-auto">
              <div className="h-2 bg-emerald-500 rounded-t-2xl"></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1 block">{viewingMedicine.category} Record</span>
                    <h3 className="text-3xl font-extrabold text-slate-800 leading-tight">{viewingMedicine.name}</h3>
                    <p className="text-slate-500 text-lg">{viewingMedicine.brand || 'Generic/Local'}</p>
                  </div>
                  <button onClick={() => setViewingMedicine(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">✕</button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Stock Level</p>
                      <p className={`text-lg font-bold ${viewingMedicine.quantity <= 2 ? 'text-red-600' : 'text-slate-700'}`}>
                        {viewingMedicine.quantity} {viewingMedicine.unit}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border border-slate-100 ${getExpiryLabel(viewingMedicine.expiryDate).color}`}>
                      <p className="text-xs font-bold uppercase mb-1 opacity-70">Expiry Status</p>
                      <p className="text-lg font-bold">
                        {getExpiryLabel(viewingMedicine.expiryDate).text}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Common Usages</p>
                    <p className="text-slate-700 leading-relaxed bg-blue-50/20 p-4 rounded-xl border border-blue-50">
                      {viewingMedicine.description || 'No specific description provided.'}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👨‍⚕️</span>
                      <p className="text-xs text-amber-700 font-bold uppercase">Doctor's Recommended Dosage</p>
                    </div>
                    <p className="text-amber-900 font-medium">
                      {viewingMedicine.dosageInstructions || 'Consult a healthcare professional for specific dosage instructions.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">Benefits</p>
                      {viewingMedicine.benefits && viewingMedicine.benefits.length > 0 ? (
                        <ul className="space-y-1.5">
                          {viewingMedicine.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-emerald-500 mt-1">✓</span> {benefit}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Not specified</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">Side Effects</p>
                      {viewingMedicine.sideEffects && viewingMedicine.sideEffects.length > 0 ? (
                        <ul className="space-y-1.5">
                          {viewingMedicine.sideEffects.map((effect, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-red-400 mt-1">•</span> {effect}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">None reported</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-4">
                    <div className="text-[10px] text-slate-400 italic uppercase">
                      Record updated: {new Date(viewingMedicine.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { handleEditClick(viewingMedicine); setViewingMedicine(null); }}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold shadow-lg shadow-slate-200"
                      >
                        Edit Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
