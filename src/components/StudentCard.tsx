import React from 'react';
import { Student, Session } from '../types';
import { getLevel } from '../constants';
import { motion } from 'motion/react';

interface StudentCardProps {
  student: Student;
  sessions: Session[];
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, sessions }) => {
  const level = getLevel(student.xp);
  
  const studentSessions = sessions.filter(s => s.studentData[student.id]);
  const maxSessions = sessions.length || 1;
  
  const stats = {
    asi: Math.round((studentSessions.filter(s => s.studentData[student.id].attendance).length / maxSessions) * 99),
    par: Math.round((studentSessions.filter(s => s.studentData[student.id].participation).length / maxSessions) * 99),
    ret: Math.round((studentSessions.filter(s => s.studentData[student.id].challenge).length / maxSessions) * 99),
    ayu: Math.round((studentSessions.filter(s => s.studentData[student.id].help).length / maxSessions) * 99),
    ins: Math.min(99, student.badges.length * 10),
    xp: Math.min(99, Math.round((student.xp / 1000) * 99))
  };

  const getCardColors = () => {
    switch (level) {
      case 'Platino': return 'from-slate-200 via-slate-100 to-slate-300 text-slate-900 border-slate-400';
      case 'Oro': return 'from-yellow-500 via-yellow-300 to-yellow-600 text-yellow-950 border-yellow-600';
      case 'Plata': return 'from-gray-400 via-gray-200 to-gray-500 text-gray-900 border-gray-500';
      default: return 'from-orange-800 via-orange-600 to-orange-900 text-orange-50 border-orange-950';
    }
  };

  const getAvatar = () => {
    switch (level) {
      case 'Platino': return 'https://picsum.photos/seed/robot-hero/300/300';
      case 'Oro': return 'https://picsum.photos/seed/super-athlete/300/300';
      case 'Plata': return 'https://picsum.photos/seed/runner-boy/300/300';
      default: return 'https://picsum.photos/seed/kid-sport/300/300';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-64 h-96 bg-linear-to-b ${getCardColors()} border-4 rounded-t-[40px] rounded-b-[10px] shadow-2xl overflow-hidden font-sans p-4 flex flex-col items-center`}
      style={{ clipPath: 'polygon(0% 10%, 50% 0%, 100% 10%, 100% 90%, 50% 100%, 0% 90%)' }}
    >
      {/* Overall Rating */}
      <div className="absolute top-12 left-6 flex flex-col items-center">
        <span className="text-4xl font-black leading-none">{student.xp}</span>
        <span className="text-xs font-bold uppercase opacity-80">XP</span>
      </div>

      {/* Level / Position */}
      <div className="absolute top-24 left-6 flex flex-col items-center">
        <span className="text-lg font-bold uppercase">{level.substring(0, 3)}</span>
        <div className="w-6 h-0.5 bg-current opacity-30 my-1" />
        <span className="text-[10px] font-bold uppercase opacity-70">{student.course.split(' ')[0]}</span>
      </div>

      {/* Avatar */}
      <div className="mt-8 w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-2 border-current/20 overflow-hidden">
        <img 
          src={getAvatar()} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Name */}
      <div className="mt-4 w-full text-center">
        <h4 className="text-xl font-black uppercase tracking-tighter truncate px-2">{student.name.split(' ')[0]}</h4>
        <div className="w-3/4 h-0.5 bg-current/20 mx-auto mt-1" />
      </div>

      {/* Stats Grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 w-full px-4">
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.asi}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">ASI</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.par}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">PAR</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.ret}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">RET</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.ayu}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">AYU</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.ins}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">INS</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg">{stats.xp}</span>
          <span className="text-[10px] font-bold uppercase opacity-70">EVO</span>
        </div>
      </div>

      {/* Badges Row */}
      <div className="mt-auto mb-6 flex gap-1 justify-center">
        {student.badges.slice(0, 4).map((b, i) => (
          <div key={i} className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-[10px] shadow-sm" title={b.badge}>
            {b.badge.split(' ')[0]}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
