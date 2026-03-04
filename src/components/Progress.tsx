import React, { useState } from 'react';
import { Student, Session } from '../types';
import { COURSES, getLevel, getLevelColor } from '../constants';
import { BarChart2, User, Users, Shield, ClipboardList, Zap, Target, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { StudentBadge } from './StudentBadge';

interface ProgressProps {
  students: Student[];
  sessions: Session[];
}

export const Progress: React.FC<ProgressProps> = ({ students, sessions }) => {
  const [viewType, setViewType] = useState<'group' | 'team' | 'individual'>('group');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const teams = [...new Set(students.map(s => s.team))].filter(Boolean).sort();
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

  const getNextLevelInfo = (xp: number) => {
    if (xp < 200) return { next: 'Plata', target: 200, remaining: 200 - xp };
    if (xp < 400) return { next: 'Oro', target: 400, remaining: 400 - xp };
    if (xp < 700) return { next: 'Platino', target: 700, remaining: 700 - xp };
    return { next: 'Máximo', target: xp, remaining: 0 };
  };

  const renderGroupView = () => {
    const courseStudents = students.filter(s => s.course === selectedCourse).sort((a, b) => b.xp - a.xp);
    if (!selectedCourse) return <p className="text-center text-slate-400 py-12 italic">Selecciona un curso para ver el progreso</p>;
    if (courseStudents.length === 0) return <p className="text-center text-slate-400 py-12 italic">No hay alumnos en este curso</p>;

    const avgXP = Math.round(courseStudents.reduce((sum, s) => sum + s.xp, 0) / courseStudents.length);

    return (
      <div className="space-y-6">
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl text-white text-center shadow-lg">
          <h3 className="text-3xl font-black mb-2">📊 {selectedCourse}</h3>
          <div className="flex justify-center gap-8 mt-4">
            <div>
              <div className="text-4xl font-black">{courseStudents.length}</div>
              <div className="text-xs uppercase font-bold opacity-70">Alumnos</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-4xl font-black">{avgXP}</div>
              <div className="text-xs uppercase font-bold opacity-70">XP Promedio</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {courseStudents.map((s, i) => {
            const { target, remaining } = getNextLevelInfo(s.xp);
            const progressPct = Math.min(100, (s.xp / target) * 100);
            
            return (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{s.name}</h4>
                    <span className="text-sm font-black text-indigo-600">{s.xp} XP</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-600"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getLevelColor(getLevel(s.xp))}`}>
                      {getLevel(s.xp)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {remaining > 0 ? `Faltan ${remaining} XP para el siguiente nivel` : '¡Nivel Máximo!'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTeamView = () => {
    const teamStudents = students.filter(s => s.team === selectedTeam).sort((a, b) => b.xp - a.xp);
    if (!selectedTeam) return <p className="text-center text-slate-400 py-12 italic">Selecciona un equipo para ver el progreso</p>;
    if (teamStudents.length === 0) return <p className="text-center text-slate-400 py-12 italic">No hay alumnos en este equipo</p>;

    const totalXP = teamStudents.reduce((sum, s) => sum + s.xp, 0);

    return (
      <div className="space-y-6">
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 p-8 rounded-2xl text-white text-center shadow-lg">
          <h3 className="text-3xl font-black mb-2">⚽ {selectedTeam}</h3>
          <div className="flex justify-center gap-8 mt-4">
            <div>
              <div className="text-4xl font-black">{teamStudents.length}</div>
              <div className="text-xs uppercase font-bold opacity-70">Miembros</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-4xl font-black">{totalXP}</div>
              <div className="text-xs uppercase font-bold opacity-70">XP Total</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamStudents.map((s, i) => (
            <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">{s.name}</h4>
                <p className="text-xs text-slate-500">{s.course}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${getLevelColor(getLevel(s.xp))}`}>
                  {getLevel(s.xp)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600">{s.xp}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Puntos</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateSuperReportPDF = async (student: Student) => {
    const doc = new jsPDF();
    const level = getLevel(student.xp);
    const studentSessions = sessions.filter(s => s.studentData[student.id]);
    const maxSessions = sessions.length || 1;
    
    const stats = {
      asi: Math.round((studentSessions.filter(s => s.studentData[student.id].attendance).length / maxSessions) * 99),
      par: Math.round((studentSessions.filter(s => s.studentData[student.id].participation).length / maxSessions) * 99),
      ret: Math.round((studentSessions.filter(s => s.studentData[student.id].challenge).length / maxSessions) * 99),
      ayu: Math.round((studentSessions.filter(s => s.studentData[student.id].help).length / maxSessions) * 99),
      ins: Math.min(99, student.badges.length * 10),
      evo: Math.min(99, Math.round((student.xp / 1000) * 99))
    };

    const drawHeader = (title: string, pageNum: number) => {
      doc.setFillColor(30, 60, 114);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Página ${pageNum}`, 200, 35, { align: 'right' });
    };

    // --- PAGE 1: PORTADA Y INSIGNIA ---
    drawHeader('INFORME DE PROGRESO EF', 1);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text(student.name.toUpperCase(), 105, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${student.course} • EQUIPO ${student.team}`, 105, 70, { align: 'center' });

    // Shield Drawing
    let badgeColor = [205, 127, 50]; // Bronze
    if (level === 'Platino') badgeColor = [148, 163, 184];
    if (level === 'Oro') badgeColor = [202, 138, 4];
    if (level === 'Plata') badgeColor = [100, 116, 139];

    const sx = 105, sy = 90, sw = 60, sh = 70;
    doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.setLineWidth(2);
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2], 0.1);
    
    // Draw Shield Path
    doc.lines([
      [sw/2, 10], [0, 40], [-sw/4, 15], [-sw/4, 5], [-sw/2, -10], [0, -50]
    ], sx, sy, [1, 1], 'FD');

    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(level.toUpperCase(), sx, sy + 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`${student.xp} XP`, sx, sy + 40, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('ESCUDO DE HONOR', 105, 170, { align: 'center' });

    // --- PAGE 2: ESTADÍSTICAS ---
    doc.addPage();
    drawHeader('ANÁLISIS DE COMPETENCIAS', 2);

    let y = 70;
    const radarLabels = ['Asistencia', 'Participación', 'Retos', 'Compañerismo', 'Insignias', 'Evolución'];
    const radarValues = [stats.asi, stats.par, stats.ret, stats.ayu, stats.ins, stats.evo];
    
    radarLabels.forEach((label, i) => {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(label, 20, y);
      doc.setFillColor(230, 230, 230);
      doc.rect(70, y - 4, 100, 4, 'F');
      doc.setFillColor(30, 60, 114);
      doc.rect(70, y - 4, radarValues[i], 4, 'F');
      y += 15;
    });

    // --- PAGE 3: INSIGNIAS ---
    doc.addPage();
    drawHeader('MURO DE INSIGNIAS', 3);
    
    let ix = 25, iy = 60;
    student.badges.forEach((b, i) => {
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(ix, iy, 40, 30, 3, 3, 'F');
      doc.setDrawColor(30, 60, 114);
      doc.roundedRect(ix, iy, 40, 30, 3, 3, 'S');
      doc.setFontSize(10);
      doc.text(b.badge, ix + 20, iy + 15, { align: 'center' });
      ix += 45;
      if (ix > 160) { ix = 25; iy += 40; }
    });

    doc.save(`Informe_EF_${student.name.replace(/ /g, '_')}.pdf`);
  };

  const renderIndividualView = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!selectedStudentId || !student) return <p className="text-center text-slate-400 py-12 italic">Selecciona un alumno para ver su ficha</p>;

    const studentSessions = sessions.filter(s => s.studentData[student.id]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const { next, target, remaining } = getNextLevelInfo(student.xp);
    const progressPct = Math.min(100, (student.xp / target) * 100);

    return (
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-1">{student.name}</h2>
            <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">{student.course} • EQUIPO {student.team}</p>
            
            <div className="max-w-md mx-auto mb-12">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-black text-slate-400 uppercase">Progreso de Nivel</span>
                <span className="text-sm font-black text-indigo-600">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full shadow-sm"
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">Nivel {getLevel(student.xp)}</span>
                <span className="text-indigo-500">Próximo: {next} ({remaining} XP restantes)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">{student.xp}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">XP Total</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">{student.badges.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Insignias</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-3xl font-black text-indigo-600">{studentSessions.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sesiones</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Shield size={20} /> Colección de Insignias
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {student.badges.length > 0 ? student.badges.map((b, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="bg-linear-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 p-3 rounded-xl text-center shadow-sm"
                  >
                    <div className="text-2xl mb-1">{b.badge.split(' ')[0]}</div>
                    <div className="text-xs font-bold text-indigo-900 leading-tight">{b.badge.split(' ').slice(1).join(' ')}</div>
                    <div className="text-[9px] text-indigo-400 font-bold mt-1">{b.date}</div>
                  </motion.div>
                )) : (
                  <p className="col-span-full text-slate-400 italic py-4 text-center">No ha conseguido insignias aún</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <ClipboardList size={20} /> Historial de Hitos
              </h4>
              <div className="space-y-3">
                {studentSessions.slice(0, 5).map(sess => {
                  const data = sess.studentData[student.id];
                  return (
                    <div key={sess.timestamp} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-xs">
                        <Zap size={18} className="text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-slate-700">{sess.sport}</span>
                          <span className="text-[10px] font-bold text-slate-400">{sess.date}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {data.attendance && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Asistencia" />}
                          {data.participation && <span className="w-2 h-2 rounded-full bg-blue-500" title="Participación" />}
                          {data.challenge && <span className="w-2 h-2 rounded-full bg-amber-500" title="Reto Superado" />}
                          {data.help && <span className="w-2 h-2 rounded-full bg-purple-500" title="Compañerismo" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {studentSessions.length === 0 && <p className="text-slate-400 italic py-4 text-center">Sin actividad reciente</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insignia de Nivel</h4>
            <StudentBadge student={student} size="lg" />
            <button 
              onClick={() => generateSuperReportPDF(student)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={20} /> Descargar Informe de Progreso
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
            <Target size={20} /> Seguimiento de Objetivos
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewType('group')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={16} className="inline mr-2" /> Grupo
            </button>
            <button 
              onClick={() => setViewType('team')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'team' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Zap size={16} className="inline mr-2" /> Equipo
            </button>
            <button 
              onClick={() => setViewType('individual')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User size={16} className="inline mr-2" /> Alumno
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {viewType === 'group' && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Seleccionar curso</label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
              >
                <option value="">Seleccionar curso</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {viewType === 'team' && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Seleccionar equipo</label>
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
              >
                <option value="">Seleccionar equipo</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {viewType === 'individual' && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Seleccionar alumno</label>
              <select 
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
              >
                <option value="">Seleccionar alumno</option>
                {sortedStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course})</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          {viewType === 'group' && renderGroupView()}
          {viewType === 'team' && renderTeamView()}
          {viewType === 'individual' && renderIndividualView()}
        </div>
      </div>
    </div>
  );
};
