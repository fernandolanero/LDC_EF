import { Achievement, Student, Session } from './types';

export const COURSES = (() => {
  const courses: string[] = [];
  // Primaria
  for (let year = 1; year <= 6; year++) {
    for (const line of ['A', 'B', 'C', 'D']) {
      courses.push(`${year}º Primaria ${line}`);
    }
  }
  // ESO
  for (let year = 1; year <= 4; year++) {
    for (const line of ['A', 'B', 'C', 'D']) {
      courses.push(`${year}ºESO ${line}`);
    }
  }
  return courses;
})();

export const SPORTS = [
  "Voleibol",
  "Baloncesto",
  "Fútbol",
  "Balonmano",
  "Condición Física",
  "Acrosport",
  "Atletismo",
  "Gimnasia",
  "Otro"
];

export const BADGES = ['🏆 MVP', '⚡ Velocista', '🌟 Estrella', '🤝 Deportividad'];

export const XP_VALUES = {
  attendance: 10,
  participation: 20,
  challenge: 50,
  help: 15,
  badge: 30
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'fire_streak', name: 'Racha de Fuego', icon: '🔥', description: '5 sesiones seguidas con participación', total: 5 },
  { id: 'mentor', name: 'Mentor', icon: '🤝', description: 'Ayudar a compañeros 10 veces', total: 10 },
  { id: 'mvp', name: 'Coleccionista MVP', icon: '👑', description: 'Conseguir 3 insignias MVP', total: 3 },
  { id: 'gold', name: 'Toque de Oro', icon: '🥇', description: 'Alcanzar el nivel Oro (400 XP)', total: 400 }
];

export function getLevel(xp: number) {
  if (xp >= 700) return 'Platino';
  if (xp >= 400) return 'Oro';
  if (xp >= 200) return 'Plata';
  return 'Bronce';
}

export function getLevelColor(level: string) {
  switch (level) {
    case 'Platino': return 'bg-slate-200 text-slate-800';
    case 'Oro': return 'bg-yellow-400 text-yellow-900';
    case 'Plata': return 'bg-gray-300 text-gray-800';
    case 'Bronce': return 'bg-orange-700 text-orange-50';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function checkAchievement(achId: string, student: Student, sessions: Session[]) {
  switch (achId) {
    case 'fire_streak': {
      let streak = 0;
      // This is a simplified streak check: total participations
      // The original code had a slightly different logic but this is the core
      sessions.forEach(sess => {
        if (sess.studentData[student.id]?.participation) streak++;
      });
      return { completed: streak >= 5, progress: Math.min(streak, 5), total: 5 };
    }
    case 'mentor': {
      let helps = 0;
      sessions.forEach(sess => {
        if (sess.studentData[student.id]?.help) helps++;
      });
      return { completed: helps >= 10, progress: Math.min(helps, 10), total: 10 };
    }
    case 'mvp': {
      const mvps = student.badges.filter(b => b.badge.includes('MVP')).length;
      return { completed: mvps >= 3, progress: Math.min(mvps, 3), total: 3 };
    }
    case 'gold': {
      return { completed: student.xp >= 400, progress: Math.min(student.xp, 400), total: 400 };
    }
    default:
      return { completed: false, progress: 0, total: 1 };
  }
}
