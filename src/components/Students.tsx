import React, { useState } from 'react';
import { Student } from '../types';
import { COURSES, getLevel, getLevelColor } from '../constants';
import { Trash2, UserPlus, Users } from 'lucide-react';

interface StudentsProps {
  students: Student[];
  onAddStudent: (name: string, course: string, team: string) => void;
  onImportStudents: (text: string) => void;
  onDeleteStudent: (id: number) => void;
  onDeleteAll: () => void;
}

export const Students: React.FC<StudentsProps> = ({ 
  students, 
  onAddStudent, 
  onImportStudents, 
  onDeleteStudent, 
  onDeleteAll 
}) => {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [team, setTeam] = useState('');
  const [importText, setImportText] = useState('');

  const handleAdd = () => {
    if (!name || !course || !team) {
      alert('Por favor, completa todos los campos');
      return;
    }
    onAddStudent(name, course, team);
    setName('');
    setTeam('');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      alert('Pega la lista de alumnos primero');
      return;
    }
    onImportStudents(importText);
    setImportText('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Añadir Alumno
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Carlos Martínez López"
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            />
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
            <label className="text-sm font-semibold text-slate-700">Equipo</label>
            <input 
              type="text" 
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Nombre del equipo"
              className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
        >
          Añadir Alumno
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <Users size={20} /> Importar Varios Alumnos
        </h3>
        <textarea 
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={6} 
          placeholder="Formato: Nombre,Curso,Equipo&#10;Ejemplo:&#10;Nombre,Curso,Equipo&#10;Ana López García,4ºESO A,Halcones Rojos&#10;Miguel Ruiz Pérez,4ºESO A,Halcones Rojos"
          className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors mb-4 font-mono text-sm"
        />
        <div className="flex justify-between items-center">
          <button 
            onClick={handleImport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
          >
            Importar Alumnos
          </button>
          <button 
            onClick={onDeleteAll}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={18} /> Borrar Todos
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">
          👥 Lista de Alumnos ({students.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map(s => (
            <div key={s.id} className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-4 rounded-xl relative shadow-md group">
              <button 
                onClick={() => onDeleteStudent(s.id)}
                className="absolute top-2 right-2 bg-white/20 hover:bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
              <h4 className="font-bold text-lg truncate pr-6">{s.name}</h4>
              <p className="text-sm opacity-90">📚 {s.course} | ⚽ {s.team}</p>
              <p className="text-sm font-semibold mt-1">⭐ {s.xp} XP</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(getLevel(s.xp))}`}>
                {getLevel(s.xp)}
              </span>
            </div>
          ))}
          {students.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-8">No hay alumnos añadidos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
