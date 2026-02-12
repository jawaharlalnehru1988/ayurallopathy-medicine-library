
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Medicine, MedicineCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  medicines: Medicine[];
}

const Dashboard: React.FC<DashboardProps> = ({ medicines }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const counts = {
      total: medicines.length,
      expiringSoon: 0,
      expired: 0,
      lowStock: 0,
      categories: {} as Record<string, number>
    };

    medicines.forEach(m => {
      const expiry = new Date(m.expiryDate);
      if (expiry < now) counts.expired++;
      else if (expiry < threeMonthsFromNow) counts.expiringSoon++;
      
      if (m.quantity <= 2) counts.lowStock++;

      counts.categories[m.category] = (counts.categories[m.category] || 0) + 1;
    });

    const categoryData = Object.entries(counts.categories).map(([name, value]) => ({ name, value }));
    
    return { ...counts, categoryData };
  }, [medicines]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#6b7280'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Medicines" value={stats.total} icon="💊" color="blue" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon="⚠️" color="yellow" />
        <StatCard title="Expired" value={stats.expired} icon="❌" color="red" />
        <StatCard title="Low Stock" value={stats.lowStock} icon="📉" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Stock Levels by Item</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicines.slice(0, 10)}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg text-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
