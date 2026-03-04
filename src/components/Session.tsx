import React, { useState, useEffect } from 'react';
import { Student, Session, StudentSessionData } from '../types';
import { COURSES, SPORTS, BADGES } from '../constants';
import { Calendar, ClipboardList, Edit, Trash2 } from 'lucide-react';

interface SessionProps {
  students: Student[];
  sessions: Session[];
  onSaveSession: (session: Session) => void;
  onDeleteSession: (timestamp: number) => void;
}

export const SessionManager: React.FC<SessionProps> = ({ 
  students, 
  sessions, 
  onSaveSession, 
  onDeleteSession 
}) => {
  const [editingTs, setEditingTs] = useState<number | null>(null);
  const [sport, setSport] = useState('Voleibol');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [challenge, setChallenge] = useState('');
  const [sessionData, setSessionData] = useState<Record<number, StudentSessionData & { badge?: string }>>({});

  const courseStudents = students.filter(s => s.course === course);

  useEffect(() => {
    // Initialize session data for current course students
    const initialData: Record<number, StudentSessionData & { badge?: string }> = {};
    courseStudents.forEach(s => {
      initialData[s.id] = {
        attendance: true,
        participation: false,
        challenge: false,
        help: false,
        badge: undefined
      };
    });
    setSessionData(initialData);
  }, [course]);

  const handleToggle = (studentId: number, field: keyof StudentSessionData) => {
    setSessionData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: !prev[studentId][field]
      }
    }));
  };

  const handleBadgeSelect = (studentId: number, badge: string) => {
    setSessionData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        badge: prev[studentId].badge === badge ? undefined : badge
      }
    }));
  };

  const handleSave = () => {
    if (!course || !date) {
      alert('Selecciona curso y fecha');
      return;
    }

    const newSession: Session = {
      timestamp: editingTs || Date.now(),
      course,
      date,
      sport,
      challenge,
      studentData: sessionData
    };

    onSaveSession(newSession);
    
    // Reset form
    setEditingTs(null);
    setCourse('');
    setChallenge('');
    setSessionData({});
  };

  const startEdit = (session: Session) => {
    setEditingTs(session.timestamp);
    setSport(session.sport);
    setCourse(session.course);
    setDate(session.date);
    setChallenge(session.challenge);
    setSessionData(session.studentData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <Calendar size={20} /> {editingTs ? 'Editar Sesión' : 'Nueva Sesión de Clase'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Deporte/Contenido</label>
            <select 
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            >
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Curso</label>
            <select 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            >
              <option value="">Seleccionar curso</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Fecha</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Descripción del Reto</label>
            <input 
              type="text" 
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="Ej: Realizar 5 saques correctos"
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>
        </div>
      </div>

      {course && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> Marcar Puntuación por Alumno
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseStudents.map(s => (
              <div key={s.id} className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                <h4 className="font-bold text-indigo-800 mb-3">{s.name}</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={sessionData[s.id]?.attendance ?? true}
                      onChange={() => handleToggle(s.id, 'attendance')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Asistencia (10 XP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={sessionData[s.id]?.participation ?? false}
                      onChange={() => handleToggle(s.id, 'participation')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Participación (20 XP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={sessionData[s.id]?.challenge ?? false}
                      onChange={() => handleToggle(s.id, 'challenge')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Reto (50 XP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={sessionData[s.id]?.help ?? false}
                      onChange={() => handleToggle(s.id, 'help')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Ayuda (15 XP)</span>
                  </label>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Insignia (+30 XP)</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map(b => (
                      <button 
                        key={b}
                        onClick={() => handleBadgeSelect(s.id, b)}
                        className={`text-xs px-2 py-1 rounded-full border-2 transition-all ${
                          sessionData[s.id]?.badge === b 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSave}
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            💾 {editingTs ? 'Actualizar Sesión y XP' : 'Guardar Sesión y Asignar XP'}
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">📋 Historial de Sesiones</h3>
        <div className="space-y-4">
          {sessions.sort((a,b) => b.timestamp - a.timestamp).map(s => (
            <div key={s.timestamp} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-indigo-700">{s.sport} - {s.course}</h4>
                <p className="text-sm text-slate-600">📅 {s.date} | 👥 {Object.keys(s.studentData).length} alumnos evaluados</p>
                {s.challenge && <p className="text-sm text-slate-500 italic mt-1">🎯 Reto: {s.challenge}</p>}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => startEdit(s)}
                  className="flex-1 sm:flex-none bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Editar
                </button>
                <button 
                  onClick={() => onDeleteSession(s.timestamp)}
                  className="flex-1 sm:flex-none bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-semibold hover:bg-rose-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Borrar
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-slate-500 py-4">No hay sesiones registradas aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
