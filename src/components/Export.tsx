import React from 'react';
import { Student, Session } from '../types';
import { getLevel } from '../constants';
import { Download, Upload, Trash2, FileJson, FileSpreadsheet } from 'lucide-react';

interface ExportProps {
  students: Student[];
  sessions: Session[];
  onImport: (data: { students: Student[]; sessions: Session[] }) => void;
  onReset: () => void;
}

export const Export: React.FC<ExportProps> = ({ students, sessions, onImport, onReset }) => {
  const exportStudentsCSV = () => {
    if (students.length === 0) return alert('No hay datos para exportar');
    let csv = 'Nombre,Curso,Equipo,XP,Nivel,Insignias\n';
    students.forEach(s => {
      csv += `"${s.name}","${s.course}","${s.team}",${s.xp},"${getLevel(s.xp)}",${s.badges.length}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alumnos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportSessionsCSV = () => {
    if (sessions.length === 0) return alert('No hay sesiones para exportar');
    let csv = 'Fecha,Deporte,Curso,Alumnos Evaluados,Reto\n';
    sessions.forEach(s => {
      csv += `"${s.date}","${s.sport}","${s.course}",${Object.keys(s.studentData).length},"${(s.challenge || '-').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sesiones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportJSON = () => {
    const data = { students, sessions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_champions_ef_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.students || data.sessions) {
          onImport(data);
          alert('Datos importados correctamente');
        }
      } catch (err) {
        alert('Error al importar: archivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
          <Download size={20} /> Guardar y Exportar Datos
        </h3>
        <p className="text-slate-500 mb-6">Descarga tus datos en diferentes formatos para usarlos en Excel o como copia de seguridad.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={exportStudentsCSV}
            className="bg-indigo-50 text-indigo-700 border-2 border-indigo-100 px-6 py-4 rounded-xl font-bold hover:bg-indigo-100 transition-all flex flex-col items-center gap-2"
          >
            <FileSpreadsheet size={24} />
            <span>CSV Alumnos</span>
          </button>
          <button 
            onClick={exportSessionsCSV}
            className="bg-indigo-50 text-indigo-700 border-2 border-indigo-100 px-6 py-4 rounded-xl font-bold hover:bg-indigo-100 transition-all flex flex-col items-center gap-2"
          >
            <FileSpreadsheet size={24} />
            <span>CSV Sesiones</span>
          </button>
          <button 
            onClick={exportJSON}
            className="bg-purple-50 text-purple-700 border-2 border-purple-100 px-6 py-4 rounded-xl font-bold hover:bg-purple-100 transition-all flex flex-col items-center gap-2"
          >
            <FileJson size={24} />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
          <Upload size={20} /> Importar o Restaurar
        </h3>
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-300 text-center">
            <input 
              type="file" 
              id="importFile" 
              accept=".json" 
              onChange={handleFileImport}
              className="hidden"
            />
            <label 
              htmlFor="importFile"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload size={32} className="text-slate-400" />
              <span className="font-bold text-slate-600">Cargar archivo JSON de Backup</span>
              <span className="text-xs text-slate-400">Selecciona el archivo descargado anteriormente</span>
            </label>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onReset}
              className="bg-rose-50 text-rose-700 border-2 border-rose-100 px-6 py-3 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <Trash2 size={20} />
              <span>Borrar Todo el Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
