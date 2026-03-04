import React, { useState, useMemo } from 'react';
import { Student, Session } from '../types';
import { getLevel, XP_VALUES } from '../constants';
import { FileText, TrendingUp, Users, User, ArrowRightLeft, BarChart as BarChartIcon, Download, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { StudentBadge } from './StudentBadge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface StatsProps {
  students: Student[];
  sessions: Session[];
}

export const Stats: React.FC<StatsProps> = ({ students, sessions }) => {
  const [statsType, setStatsType] = useState('evolution');
  const [scope, setScope] = useState<'individual' | 'group' | 'team'>('individual');
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [compareId1, setCompareId1] = useState<string>('');
  const [compareId2, setCompareId2] = useState<string>('');

  const groups = useMemo(() => [...new Set(students.map(s => s.course))].sort(), [students]);
  const teams = useMemo(() => [...new Set(students.map(s => s.team))].filter(Boolean).sort(), [students]);

  // Calculate evolution data for a specific student, group or team
  const evolutionData = useMemo(() => {
    if (sessions.length === 0) return [];
    
    let targetStudents = students;
    if (scope === 'individual') {
      if (!selectedId) return [];
      targetStudents = students.filter(s => s.id === Number(selectedId));
    } else if (scope === 'group') {
      if (!selectedGroup) return [];
      targetStudents = students.filter(s => s.course === selectedGroup);
    } else if (scope === 'team') {
      if (!selectedTeam) return [];
      targetStudents = students.filter(s => s.team === selectedTeam);
    }

    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulativeXP = 0;
    
    return sortedSessions.map(session => {
      let sessionXP = 0;
      targetStudents.forEach(student => {
        const studentData = session.studentData[student.id];
        if (studentData) {
          if (studentData.attendance) sessionXP += XP_VALUES.attendance;
          if (studentData.participation) sessionXP += XP_VALUES.participation;
          if (studentData.challenge) sessionXP += XP_VALUES.challenge;
          if (studentData.help) sessionXP += XP_VALUES.help;
          if (studentData.badge) sessionXP += XP_VALUES.badge;
        }
      });
      
      // For group/team, we show average XP
      const avgSessionXP = targetStudents.length > 0 ? sessionXP / targetStudents.length : 0;
      cumulativeXP += avgSessionXP;

      return {
        date: session.date,
        xp: Math.round(cumulativeXP),
        sport: session.sport
      };
    });
  }, [scope, selectedId, selectedGroup, selectedTeam, sessions, students]);

  // Calculate skill radar data for comparison
  const getRadarData = (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student) return [];
    
    const studentSessions = sessions.filter(s => s.studentData[id]);
    const stats = {
      asistencia: studentSessions.filter(s => s.studentData[id].attendance).length,
      participacion: studentSessions.filter(s => s.studentData[id].participation).length,
      retos: studentSessions.filter(s => s.studentData[id].challenge).length,
      ayuda: studentSessions.filter(s => s.studentData[id].help).length,
      insignias: student.badges.length
    };

    const maxSessions = sessions.length || 1;

    return [
      { subject: 'Asistencia', A: (stats.asistencia / maxSessions) * 100, fullMark: 100 },
      { subject: 'Participación', A: (stats.participacion / maxSessions) * 100, fullMark: 100 },
      { subject: 'Retos', A: (stats.retos / maxSessions) * 100, fullMark: 100 },
      { subject: 'Ayuda', A: (stats.ayuda / maxSessions) * 100, fullMark: 100 },
      { subject: 'Insignias', A: (stats.insignias / 10) * 100, fullMark: 100 },
    ];
  };

  const comparisonData = useMemo(() => {
    if (!compareId1 || !compareId2) return [];
    const data1 = getRadarData(Number(compareId1));
    const data2 = getRadarData(Number(compareId2));
    
    return data1.map((item, idx) => ({
      subject: item.subject,
      A: item.A,
      B: data2[idx].A,
      fullMark: 100
    }));
  }, [compareId1, compareId2, students, sessions]);

  const generatePremiumPDF = async () => {
    const doc = new jsPDF();
    const student = students.find(s => s.id === Number(selectedId));
    if (!student) return;

    const level = getLevel(student.xp);
    
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

    const radar = getRadarData(student.id);
    let y = 70;
    radar.forEach(stat => {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(stat.subject, 20, y);
      doc.setFillColor(230, 230, 230);
      doc.rect(70, y - 4, 100, 4, 'F');
      doc.setFillColor(30, 60, 114);
      doc.rect(70, y - 4, stat.A, 4, 'F');
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
            <TrendingUp size={20} /> Análisis Avanzado de Rendimiento
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setStatsType('evolution')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${statsType === 'evolution' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TrendingUp size={16} className="inline mr-2" /> Evolución
            </button>
            <button 
              onClick={() => setStatsType('versus')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${statsType === 'versus' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ArrowRightLeft size={16} className="inline mr-2" /> Versus
            </button>
            <button 
              onClick={() => setStatsType('distribution')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${statsType === 'distribution' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChartIcon size={16} className="inline mr-2" /> Distribución
            </button>
          </div>
        </div>

        {statsType === 'evolution' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nivel de Análisis</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setScope('individual')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${scope === 'individual' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Alumno
                  </button>
                  <button 
                    onClick={() => setScope('group')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${scope === 'group' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Grupo
                  </button>
                  <button 
                    onClick={() => setScope('team')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${scope === 'team' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Equipo
                  </button>
                </div>
              </div>

              {scope === 'individual' && (
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seleccionar Alumno</label>
                  <select 
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.course})</option>
                    ))}
                  </select>
                </div>
              )}

              {scope === 'group' && (
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seleccionar Grupo</label>
                  <select 
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              {scope === 'team' && (
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seleccionar Equipo</label>
                  <select 
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>

            {(selectedId || selectedGroup || selectedTeam) ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-[400px] w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                        <YAxis stroke="#64748b" fontSize={12} tickMargin={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="xp" 
                          stroke="#4f46e5" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {scope === 'individual' && (
                    <div className="flex justify-end">
                      <button 
                        onClick={generatePremiumPDF}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                      >
                        <Download size={20} /> Descargar Informe de Progreso
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-widest">Estado Actual</h4>
                  {scope === 'individual' ? (
                    <StudentBadge student={students.find(s => s.id === Number(selectedId))!} size="lg" />
                  ) : (
                    <div className="bg-slate-50 p-8 rounded-full border-4 border-slate-200 flex flex-col items-center justify-center w-64 h-64 text-center">
                      <Users size={48} className="text-slate-300 mb-2" />
                      <div className="text-4xl font-black text-slate-800">
                        {evolutionData.length > 0 ? evolutionData[evolutionData.length - 1].xp : 0}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Promedio</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Selecciona un nivel de análisis y un objetivo para visualizar los datos</p>
              </div>
            )}
          </div>
        )}

        {statsType === 'versus' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Alumno A</label>
                <select 
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
                >
                  <option value="">Seleccionar...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Alumno B</label>
                <select 
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 outline-hidden transition-colors"
                >
                  <option value="">Seleccionar...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {compareId1 && compareId2 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name={students.find(s => s.id === Number(compareId1))?.name}
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name={students.find(s => s.id === Number(compareId2))?.name}
                        dataKey="B"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.5}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 text-center mb-4">Comparativa Directa</h4>
                  {comparisonData.map(stat => {
                    const diff = stat.A - stat.B;
                    return (
                      <div key={stat.subject} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>{stat.subject}</span>
                          <span className={diff > 0 ? 'text-indigo-600' : diff < 0 ? 'text-pink-600' : ''}>
                            {diff > 0 ? `+${Math.round(diff)}% A` : diff < 0 ? `+${Math.round(Math.abs(diff))}% B` : 'Empate'}
                          </span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-indigo-500 h-full transition-all" style={{ width: `${stat.A}%` }} />
                          <div className="bg-pink-500 h-full transition-all" style={{ width: `${stat.B}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <ArrowRightLeft size={48} className="mb-4 opacity-20" />
                <p>Selecciona dos alumnos para comparar sus perfiles de habilidad</p>
              </div>
            )}
          </div>
        )}

        {statsType === 'distribution' && (
          <div className="space-y-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Bronce', count: students.filter(s => getLevel(s.xp) === 'Bronce').length, color: '#CD7F32' },
                  { name: 'Plata', count: students.filter(s => getLevel(s.xp) === 'Plata').length, color: '#C0C0C0' },
                  { name: 'Oro', count: students.filter(s => getLevel(s.xp) === 'Oro').length, color: '#FFD700' },
                  { name: 'Platino', count: students.filter(s => getLevel(s.xp) === 'Platino').length, color: '#E5E4E2' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {students.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Bronce', 'Plata', 'Oro', 'Platino'].map(lvl => {
                const count = students.filter(s => getLevel(s.xp) === lvl).length;
                const pct = students.length ? Math.round((count / students.length) * 100) : 0;
                return (
                  <div key={lvl} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-sm font-bold text-slate-400 uppercase">{lvl}</div>
                    <div className="text-3xl font-black text-slate-800 my-1">{count}</div>
                    <div className="text-xs font-bold text-indigo-600">{pct}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
