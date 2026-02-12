
import React, { useState, useMemo } from 'react';
import { Disease, DiseaseSeverity } from '../types';
import { getDiseaseInfo } from '../services/geminiService';

interface DiseaseGuideProps {
  diseases: Disease[];
  onAdd: (disease: Partial<Disease>) => void;
  onUpdate: (disease: Partial<Disease>) => void;
  onDelete: (id: string) => void;
}

const SEVERITY_COLORS = {
  [DiseaseSeverity.MILD]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [DiseaseSeverity.MEDIUM]: 'bg-amber-100 text-amber-700 border-amber-200',
  [DiseaseSeverity.CHRONIC]: 'bg-rose-100 text-rose-700 border-rose-200',
};

const DiseaseGuide: React.FC<DiseaseGuideProps> = ({ diseases, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDisease, setViewingDisease] = useState<Disease | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Disease>>({
    name: '',
    severity: DiseaseSeverity.MILD,
    symptoms: [],
    diagnosingMethods: [],
    rootCauses: [],
    solutions: [],
    specialist: '',
  });

  const filteredDiseases = useMemo(() => {
    return diseases.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [diseases, searchTerm]);

  const handleAiAssist = async () => {
    if (!formData.name) return alert('Enter a disease name first.');
    setIsAiLoading(true);
    const info = await getDiseaseInfo(formData.name);
    if (info) {
      setFormData(prev => ({
        ...prev,
        ...info
      }));
    }
    setIsAiLoading(false);
  };

  const openForm = (disease?: Disease) => {
    if (disease) {
      setFormData(disease);
      setEditingId(disease.id);
    } else {
      setFormData({
        name: '',
        severity: DiseaseSeverity.MILD,
        symptoms: [],
        diagnosingMethods: [],
        rootCauses: [],
        solutions: [],
        specialist: '',
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
    } else {
      onAdd(formData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search registry conditions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <button 
          onClick={() => openForm()}
          className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          <span>➕</span> Register Disease
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiseases.map(disease => (
          <div 
            key={disease.id} 
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${SEVERITY_COLORS[disease.severity]}`}>
                  {disease.severity}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openForm(disease)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600">✏️</button>
                  <button onClick={() => onDelete(disease.id)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600">🗑️</button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{disease.name}</h3>
              <p className="text-xs text-slate-400 mb-4 italic">Approached by: {disease.specialist || 'General Practitioner'}</p>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Core Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {disease.symptoms.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-slate-600">
                        {s}
                      </span>
                    ))}
                    {disease.symptoms.length > 3 && <span className="text-[10px] text-slate-400">+{disease.symptoms.length - 3} more</span>}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewingDisease(disease)}
                className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
              >
                Full Analysis
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Registry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-slate-800">{editingId ? 'Update Registry' : 'Register New Disease'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Disease Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={handleAiAssist}
                      disabled={isAiLoading}
                      className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-2 whitespace-nowrap"
                    >
                      {isAiLoading ? '...' : '✨ AI Assist'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Severity</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    value={formData.severity}
                    onChange={e => setFormData({...formData, severity: e.target.value as DiseaseSeverity})}
                  >
                    {Object.values(DiseaseSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Symptoms (comma separated)</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-20"
                    value={formData.symptoms?.join(', ')}
                    onChange={e => setFormData({...formData, symptoms: e.target.value.split(',').map(s => s.trim()).filter(s => s)}) }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Diagnosing Methods</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-20"
                    value={formData.diagnosingMethods?.join(', ')}
                    onChange={e => setFormData({...formData, diagnosingMethods: e.target.value.split(',').map(s => s.trim()).filter(s => s)}) }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Root Cause Analysis</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-20"
                    value={formData.rootCauses?.join(', ')}
                    onChange={e => setFormData({...formData, rootCauses: e.target.value.split(',').map(s => s.trim()).filter(s => s)}) }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Solutions / Therapies</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-20"
                      value={formData.solutions?.join(', ')}
                      onChange={e => setFormData({...formData, solutions: e.target.value.split(',').map(s => s.trim()).filter(s => s)}) }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Approaching Specialist</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cardiologist, Vaidya"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={formData.specialist}
                      onChange={e => setFormData({...formData, specialist: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  {editingId ? 'Save Registry' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {viewingDisease && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className={`h-3 ${SEVERITY_COLORS[viewingDisease.severity].split(' ')[0].replace('bg-', 'bg-')}`}></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${SEVERITY_COLORS[viewingDisease.severity]}`}>
                      {viewingDisease.severity} Condition
                    </span>
                    <span className="text-slate-400 text-xs font-medium tracking-wide">• Clinical Registry #{viewingDisease.id.slice(0, 4)}</span>
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-800">{viewingDisease.name}</h3>
                </div>
                <button onClick={() => setViewingDisease(null)} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Primary Symptoms
                  </h4>
                  <ul className="space-y-2">
                    {viewingDisease.symptoms.map((s, i) => (
                      <li key={i} className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">{s}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Diagnosing Methods
                  </h4>
                  <ul className="space-y-2">
                    {viewingDisease.diagnosingMethods.map((m, i) => (
                      <li key={i} className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">{m}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Root Cause Analysis
                  </h4>
                  <ul className="space-y-2">
                    {viewingDisease.rootCauses.map((c, i) => (
                      <li key={i} className="text-slate-700 italic bg-amber-50/30 p-3 rounded-xl border border-amber-100/50 text-sm">
                        "{c}"
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Recommended Solutions
                  </h4>
                  <div className="space-y-2">
                    {viewingDisease.solutions.map((sol, i) => (
                      <div key={i} className="text-emerald-800 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-sm flex gap-2">
                        <span>🛡️</span> {sol}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-100">👨‍⚕️</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Specialist Contact</p>
                    <p className="text-sm font-bold text-slate-700">{viewingDisease.specialist || 'Consult General Practice'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { openForm(viewingDisease); setViewingDisease(null); }}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Edit Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseGuide;
