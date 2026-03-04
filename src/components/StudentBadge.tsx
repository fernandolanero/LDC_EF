import React from 'react';
import { Student } from '../types';
import { getLevel } from '../constants';
import { motion } from 'motion/react';

interface StudentBadgeProps {
  student: Student;
  size?: 'sm' | 'md' | 'lg';
}

export const StudentBadge: React.FC<StudentBadgeProps> = ({ student, size = 'md' }) => {
  const level = getLevel(student.xp);
  
  const getAvatar = () => {
    switch (level) {
      case 'Platino': return 'https://picsum.photos/seed/robot-hero/300/300';
      case 'Oro': return 'https://picsum.photos/seed/super-athlete/300/300';
      case 'Plata': return 'https://picsum.photos/seed/runner-boy/300/300';
      default: return 'https://picsum.photos/seed/kid-sport/300/300';
    }
  };

  const getColors = () => {
    switch (level) {
      case 'Platino': return 'from-slate-100 via-slate-200 to-slate-400 border-slate-500 text-slate-800 shadow-slate-200';
      case 'Oro': return 'from-yellow-200 via-yellow-400 to-yellow-600 border-yellow-700 text-yellow-900 shadow-yellow-100';
      case 'Plata': return 'from-gray-100 via-gray-300 to-gray-500 border-gray-600 text-gray-800 shadow-gray-100';
      default: return 'from-orange-300 via-orange-500 to-orange-700 border-orange-800 text-white shadow-orange-100';
    }
  };

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-48 h-64',
    lg: 'w-64 h-80'
  };

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Shield Shape SVG Background */}
        <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`grad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {level === 'Platino' && <><stop offset="0%" stopColor="#f8fafc" /><stop offset="50%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#94a3b8" /></>}
              {level === 'Oro' && <><stop offset="0%" stopColor="#fef08a" /><stop offset="50%" stopColor="#facc15" /><stop offset="100%" stopColor="#a16207" /></>}
              {level === 'Plata' && <><stop offset="0%" stopColor="#f1f5f9" /><stop offset="50%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#64748b" /></>}
              {level === 'Bronce' && <><stop offset="0%" stopColor="#fdba74" /><stop offset="50%" stopColor="#f97316" /><stop offset="100%" stopColor="#9a3412" /></>}
            </linearGradient>
          </defs>
          <path 
            d="M50 0 L100 20 L100 70 C100 95 75 115 50 120 C25 115 0 95 0 70 L0 20 Z" 
            fill={`url(#grad-${level})`}
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        {/* Avatar Container (Clipped to Shield) */}
        <div className="relative z-10 w-[85%] h-[75%] mt-[-10%] overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%)' }}>
          <img 
            src={getAvatar()} 
            alt={level} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Level Banner */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md px-4 py-1 rounded-lg shadow-lg border border-black/5 transform -rotate-1">
          <span className="text-[12px] font-black uppercase tracking-widest text-slate-800">{level}</span>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tight leading-none">{student.name.split(' ')[0]}</h4>
        <div className="inline-block bg-indigo-600 text-white px-3 py-0.5 rounded-full mt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest">{student.xp} XP</p>
        </div>
      </div>
    </motion.div>
  );
};
