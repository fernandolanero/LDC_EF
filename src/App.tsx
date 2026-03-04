import React, { useState, useEffect } from 'react';
import { Student, Session, TabType } from './types';
import { XP_VALUES } from './constants';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { SessionManager } from './components/Session';
import { Ranking } from './components/Ranking';
import { Achievements } from './components/Achievements';
import { Progress } from './components/Progress';
import { Stats } from './components/Stats';
import { Export } from './components/Export';
import { LayoutDashboard, Users, Calendar, Trophy, Award, BarChart2, TrendingUp, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DB_KEYS = {
  students: 'championsEF_students',
  sessions: 'championsEF_sessions'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load initial data
  useEffect(() => {
    const savedStudents = localStorage.getItem(DB_KEYS.students);
    const savedSessions = localStorage.getItem(DB_KEYS.sessions);
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem(DB_KEYS.students, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  const handleAddStudent = (name: string, course: string, team: string) => {
    const newStudent: Student = {
      id: Date.now(),
      name,
      course,
      team,
      xp: 0,
      badges: []
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleImportStudents = (text: string) => {
    const lines = text.split('\n');
    const newStudents: Student[] = [];
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines
      
      const parts = trimmedLine.split(',').map(p => p.trim());
      
      // Skip header if present
      if (idx === 0 && parts[0].toLowerCase() === 'nombre' && parts[1].toLowerCase() === 'curso') {
        return;
      }

      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        newStudents.push({
          id: Date.now() + idx,
          name: parts[0],
          course: parts[1],
          team: parts[2],
          xp: 0,
          badges: []
        });
      }
    });
    setStudents(prev => [...prev, ...newStudents]);
  };

  const handleDeleteStudent = (id: number) => {
    if (confirm('¿Eliminar este alumno? Se perderán todos sus datos.')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDeleteAllStudents = () => {
    if (confirm('⚠️ ¿Borrar TODOS los alumnos? Esta acción no se puede deshacer.')) {
      setStudents([]);
    }
  };

  const calculateXP = (data: any) => {
    let xp = 0;
    if (data.attendance) xp += XP_VALUES.attendance;
    if (data.participation) xp += XP_VALUES.participation;
    if (data.challenge) xp += XP_VALUES.challenge;
    if (data.help) xp += XP_VALUES.help;
    if (data.badge) xp += XP_VALUES.badge;
    return xp;
  };

  const handleSaveSession = (newSession: Session) => {
    const existingSessionIdx = sessions.findIndex(s => s.timestamp === newSession.timestamp);
    let updatedStudents = [...students];

    // If editing, revert old session XP first
    if (existingSessionIdx !== -1) {
      const oldSession = sessions[existingSessionIdx];
      updatedStudents = updatedStudents.map(s => {
        if (oldSession.studentData[s.id]) {
          const oldXP = calculateXP(oldSession.studentData[s.id]);
          const newBadges = s.badges.filter(b => b.date !== oldSession.date);
          return { ...s, xp: Math.max(0, s.xp - oldXP), badges: newBadges };
        }
        return s;
      });
    }

    // Apply new session XP and badges
    updatedStudents = updatedStudents.map(s => {
      const data = newSession.studentData[s.id];
      if (data) {
        const xpGained = calculateXP(data);
        const newBadges = [...s.badges];
        if (data.badge) {
          newBadges.push({ badge: data.badge, date: newSession.date });
        }
        return { ...s, xp: s.xp + xpGained, badges: newBadges };
      }
      return s;
    });

    setStudents(updatedStudents);
    
    if (existingSessionIdx !== -1) {
      const newSessions = [...sessions];
      newSessions[existingSessionIdx] = newSession;
      setSessions(newSessions);
    } else {
      setSessions(prev => [...prev, newSession]);
    }
  };

  const handleDeleteSession = (timestamp: number) => {
    if (!confirm('¿Borrar esta sesión? Se revertirá el XP asignado.')) return;
    
    const sessionToDelete = sessions.find(s => s.timestamp === timestamp);
    if (!sessionToDelete) return;

    const updatedStudents = students.map(s => {
      if (sessionToDelete.studentData[s.id]) {
        const xpToRem = calculateXP(sessionToDelete.studentData[s.id]);
        const newBadges = s.badges.filter(b => b.date !== sessionToDelete.date);
        return { ...s, xp: Math.max(0, s.xp - xpToRem), badges: newBadges };
      }
      return s;
    });

    setStudents(updatedStudents);
    setSessions(prev => prev.filter(s => s.timestamp !== timestamp));
  };

  const handleImportData = (data: { students: Student[]; sessions: Session[] }) => {
    if (data.students) setStudents(data.students);
    if (data.sessions) setSessions(data.sessions);
  };

  const handleReset = () => {
    if (confirm('⚠️ ¿BORRAR TODO? Se perderán alumnos y sesiones.')) {
      setStudents([]);
      setSessions([]);
      localStorage.clear();
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Alumnos', icon: Users },
    { id: 'session', label: 'Sesión', icon: Calendar },
    { id: 'ranking', label: 'Rankings', icon: Trophy },
    { id: 'achievements', label: 'Logros', icon: Award },
    { id: 'progress', label: 'Progreso', icon: BarChart2 },
    { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
    { id: 'export', label: 'Datos', icon: Save },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-linear-to-r from-indigo-800 to-purple-900 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-black tracking-tight mb-2">⚽ Liga de Campeones EF</h1>
          <p className="text-indigo-100 font-medium opacity-90">Sistema de Gamificación para Educación Física</p>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 py-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard students={students} sessions={sessions} />}
            {activeTab === 'students' && (
              <Students 
                students={students} 
                onAddStudent={handleAddStudent} 
                onImportStudents={handleImportStudents}
                onDeleteStudent={handleDeleteStudent}
                onDeleteAll={handleDeleteAllStudents}
              />
            )}
            {activeTab === 'session' && (
              <SessionManager 
                students={students} 
                sessions={sessions} 
                onSaveSession={handleSaveSession}
                onDeleteSession={handleDeleteSession}
              />
            )}
            {activeTab === 'ranking' && <Ranking students={students} />}
            {activeTab === 'achievements' && <Achievements students={students} sessions={sessions} />}
            {activeTab === 'progress' && <Progress students={students} sessions={sessions} />}
            {activeTab === 'stats' && <Stats students={students} sessions={sessions} />}
            {activeTab === 'export' && (
              <Export 
                students={students} 
                sessions={sessions} 
                onImport={handleImportData} 
                onReset={handleReset} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto p-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-12">
        <p>© {new Date().getFullYear()} Liga de Campeones EF - Herramienta de Educación Física</p>
      </footer>
    </div>
  );
}
