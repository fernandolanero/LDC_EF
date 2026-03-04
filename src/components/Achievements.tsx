import React from 'react';
import { Student, Session } from '../types';
import { ACHIEVEMENTS, checkAchievement } from '../constants';
import { Award } from 'lucide-react';

interface AchievementsProps {
  students: Student[];
  sessions: Session[];
}

export const Achievements: React.FC<AchievementsProps> = ({ students, sessions }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <Award size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">Añade alumnos primero para ver los logros</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-semibold text-indigo-700 mb-2 flex items-center gap-2">
        <Award size={20} /> Sistema de Logros Global
      </h3>
      <p className="text-slate-500 mb-8">Porcentaje de estudiantes que han desbloqueado cada logro</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ACHIEVEMENTS.map(ach => {
          let unlockedCount = 0;
          students.forEach(s => {
            if (checkAchievement(ach.id, s, sessions).completed) unlockedCount++;
          });
          
          const pct = students.length > 0 ? Math.round((unlockedCount / students.length) * 100) : 0;
          const isAnyUnlocked = unlockedCount > 0;

          return (
            <div 
              key={ach.id} 
              className={`p-6 rounded-2xl border-4 transition-all text-center relative overflow-hidden group ${
                isAnyUnlocked 
                  ? 'bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 opacity-60 grayscale'
              }`}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{ach.icon}</div>
              <h4 className="font-bold text-indigo-900 mb-1">{ach.name}</h4>
              <p className="text-xs text-slate-600 mb-4 h-8 flex items-center justify-center">{ach.description}</p>
              
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-indigo-700">{unlockedCount}/{students.length} alumnos</span>
                <span className="text-xs font-bold text-indigo-700">{pct}%</span>
              </div>
              
              <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-linear-to-r from-indigo-500 to-purple-600 h-full transition-all duration-1000" 
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
