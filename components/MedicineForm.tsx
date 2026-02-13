
import React, { useState, useEffect } from 'react';
import { Medicine, MedicineCategory } from '../types';
import { getMedicineInfo } from '../services/geminiService';

interface MedicineFormProps {
  initialData?: Medicine | null;
  onSubmit: (med: Partial<Medicine>) => void;
  onCancel: () => void;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    brand: '',
    category: MedicineCategory.AYURVEDIC,
    quantity: 1,
    unit: 'Tablets',
    expiryDate: '',
    description: '',
    ingredients: [],
    sideEffects: [],
    benefits: [],
    dosageInstructions: '',
    ...initialData
  });

  const [benefitsInput, setBenefitsInput] = useState(formData.benefits?.join(', ') || '');
  const [sideEffectsInput, setSideEffectsInput] = useState(formData.sideEffects?.join(', ') || '');

  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAssist = async () => {
    if (!formData.name) return alert('Please enter medicine name first.');
    setIsAiLoading(true);
    const info = await getMedicineInfo(formData.name, formData.category || 'Medicine');
    if (info) {
      setBenefitsInput(info.benefits?.join(', ') || benefitsInput);
      setSideEffectsInput(info.sideEffects?.join(', ') || sideEffectsInput);

      setFormData(prev => ({
        ...prev,
        description: info.description || prev.description,
        ingredients: info.ingredients || prev.ingredients,
        dosageInstructions: info.dosageInstructions || prev.dosageInstructions,
        sideEffects: info.sideEffects || prev.sideEffects,
        benefits: info.benefits || prev.benefits,
      }));
    }
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) return alert('Name and Expiry Date are required.');
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? 'Edit Medicine' : 'Add New Medicine'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Medicine Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isAiLoading}
                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-2"
                title="Use AI to fill details"
              >
                {isAiLoading ? '...' : '✨ AI'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Brand / Manufacturer</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as MedicineCategory })}
            >
              {Object.values(MedicineCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Expiry Date *</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Quantity</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Unit</label>
            <input
              type="text"
              placeholder="e.g. ml, tablets, strips"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Description / Uses</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-20"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Dosage Instructions (e.g. as per doctor advice)</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-16"
            value={formData.dosageInstructions}
            onChange={e => setFormData({ ...formData, dosageInstructions: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Benefits (comma separated)</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-20"
              value={benefitsInput}
              onChange={e => {
                setBenefitsInput(e.target.value);
                setFormData({ ...formData, benefits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Side Effects (comma separated)</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-20"
              value={sideEffectsInput}
              onChange={e => {
                setSideEffectsInput(e.target.value);
                setFormData({ ...formData, sideEffects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 pb-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Save Medicine
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;
