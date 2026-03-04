import React from 'react';
import { Student, Session } from '../types';
import { TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  sessions: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, sessions }) => {
  const totalXP = students.reduce((sum, s) => sum + s.xp, 0);
  const totalBadges = students.reduce((sum, s) => sum + s.badges.length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Bienvenido al Sistema Liga de Campeones EF</h3>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800">
          <strong className="block mb-2">Inicio rápido:</strong>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Añade alumnos en la pestaña "Alumnos"</li>
            <li>Registra tus primeras sesiones en "Registrar Sesión"</li>
            <li>Visualiza los rankings y evalúa el progreso individual y grupal.</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl text-center shadow-md">
          <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">Total Alumnos</div>
          <div className="text-4xl font-bold my-2">{students.length}</div>
        </div>
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl text-center shadow-md">
          <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">Sesiones Registradas</div>
          <div className="text-4xl font-bold my-2">{sessions.length}</div>
        </div>
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl text-center shadow-md">
          <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">XP Total Repartida</div>
          <div className="text-4xl font-bold my-2">{totalXP}</div>
        </div>
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl text-center shadow-md">
          <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">Insignias Otorgadas</div>
          <div className="text-4xl font-bold my-2">{totalBadges}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" /> Rendimiento de la Clase
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Participación Media</span>
              <span className="text-lg font-bold text-indigo-600">
                {sessions.length > 0 
                  ? Math.round((students.reduce((acc, s) => acc + sessions.filter(sess => sess.studentData[s.id]?.participation).length, 0) / (students.length * sessions.length)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Asistencia Media</span>
              <span className="text-lg font-bold text-indigo-600">
                {sessions.length > 0 
                  ? Math.round((students.reduce((acc, s) => acc + sessions.filter(sess => sess.studentData[s.id]?.attendance).length, 0) / (students.length * sessions.length)) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-rose-500" /> Alumnos con baja participación
          </h3>
          <div className="space-y-2">
            {students
              .map(s => ({
                ...s,
                participationRate: sessions.length > 0 
                  ? (sessions.filter(sess => sess.studentData[s.id]?.participation).length / sessions.length) 
                  : 1
              }))
              .filter(s => s.participationRate < 0.4 && sessions.length >= 3)
              .slice(0, 5)
              .map(s => (
                <div key={s.id} className="flex justify-between items-center p-2 hover:bg-rose-50 rounded-lg transition-colors">
                  <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                    {Math.round(s.participationRate * 100)}% participación
                  </span>
                </div>
              ))}
            {(students.length === 0 || sessions.length < 3) && (
              <p className="text-sm text-slate-400 italic">Se necesitan al menos 3 sesiones para analizar tendencias.</p>
            )}
            {students.length > 0 && sessions.length >= 3 && students.filter(s => (sessions.filter(sess => sess.studentData[s.id]?.participation).length / sessions.length) < 0.4).length === 0 && (
              <p className="text-sm text-emerald-600 font-medium">¡Excelente! Todos los alumnos mantienen una buena participación.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
