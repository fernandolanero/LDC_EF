import React, { useState } from 'react';
import { Student } from '../types';
import { COURSES, getLevel, getLevelColor } from '../constants';
import { Trophy, Medal } from 'lucide-react';

interface RankingProps {
  students: Student[];
}

export const Ranking: React.FC<RankingProps> = ({ students }) => {
  const [filter, setFilter] = useState('');

  const filteredStudents = filter 
    ? students.filter(s => s.course === filter)
    : students;

  const sortedStudents = [...filteredStudents].sort((a, b) => b.xp - a.xp);

  const teams: Record<string, { name: string; xp: number; count: number }> = {};
  students.forEach(s => {
    if (!teams[s.team]) teams[s.team] = { name: s.team, xp: 0, count: 0 };
    teams[s.team].xp += s.xp;
    teams[s.team].count++;
  });

  const sortedTeams = Object.values(teams).sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
          <Trophy size={20} /> Ranking Individual
        </h3>
        
        <div className="mb-8 max-w-xs">
          <label className="text-sm font-semibold text-slate-700 block mb-1">Filtrar por curso</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
          >
            <option value="">Todos los cursos</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {sortedStudents.length >= 3 && (
          <div className="flex flex-col sm:flex-row justify-center items-end gap-4 mb-12 px-4">
            {/* Second Place */}
            <div className="order-2 sm:order-1 flex-1 max-w-[200px] w-full text-center bg-slate-50 p-6 rounded-t-2xl border-x-2 border-t-2 border-slate-200 shadow-sm">
              <div className="text-4xl mb-2">🥈</div>
              <h4 className="font-bold text-slate-800 truncate">{sortedStudents[1].name}</h4>
              <p className="text-indigo-600 font-bold">{sortedStudents[1].xp} XP</p>
            </div>
            {/* First Place */}
            <div className="order-1 sm:order-2 flex-1 max-w-[220px] w-full text-center bg-indigo-50 p-8 rounded-t-2xl border-x-2 border-t-2 border-indigo-200 shadow-md transform sm:scale-110 z-10">
              <div className="text-5xl mb-2">🥇</div>
              <h4 className="font-bold text-indigo-900 truncate">{sortedStudents[0].name}</h4>
              <p className="text-indigo-600 font-bold text-lg">{sortedStudents[0].xp} XP</p>
            </div>
            {/* Third Place */}
            <div className="order-3 sm:order-3 flex-1 max-w-[200px] w-full text-center bg-orange-50 p-6 rounded-t-2xl border-x-2 border-t-2 border-orange-200 shadow-sm">
              <div className="text-4xl mb-2">🥉</div>
              <h4 className="font-bold text-orange-900 truncate">{sortedStudents[2].name}</h4>
              <p className="text-orange-700 font-bold">{sortedStudents[2].xp} XP</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-indigo-600 to-purple-700 text-white">
                <th className="p-4 rounded-tl-lg">Pos.</th>
                <th className="p-4">Alumno</th>
                <th className="p-4">Curso</th>
                <th className="p-4">Equipo</th>
                <th className="p-4">XP</th>
                <th className="p-4">Nivel</th>
                <th className="p-4 rounded-tr-lg">Insignias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedStudents.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-indigo-600 text-lg">{i + 1}</td>
                  <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="p-4 text-slate-600">{s.course}</td>
                  <td className="p-4 text-slate-600">{s.team}</td>
                  <td className="p-4 font-bold text-indigo-700">{s.xp}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(getLevel(s.xp))}`}>
                      {getLevel(s.xp)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{s.badges.length}</td>
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">No hay datos para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
          <Medal size={20} /> Ranking por Equipos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTeams.map((t, i) => (
            <div key={t.name} className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-md relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12">
                <Medal size={80} />
              </div>
              <h4 className="font-bold text-xl mb-1">{i + 1}. {t.name}</h4>
              <p className="text-sm opacity-90">⭐ {t.xp} XP Total</p>
              <p className="text-sm opacity-90">👥 {t.count} miembros</p>
              <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (t.xp / (t.count * 1000)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {sortedTeams.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-4">No hay equipos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};
