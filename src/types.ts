export interface Badge {
  badge: string;
  date: string;
}

export interface Student {
  id: number;
  name: string;
  course: string;
  team: string;
  xp: number;
  badges: Badge[];
}

export interface StudentSessionData {
  attendance: boolean;
  participation: boolean;
  challenge: boolean;
  help: boolean;
  badge?: string;
}

export interface Session {
  timestamp: number;
  course: string;
  date: string;
  sport: string;
  challenge: string;
  studentData: Record<number, StudentSessionData>;
}

export type TabType = 'dashboard' | 'students' | 'session' | 'ranking' | 'achievements' | 'progress' | 'stats' | 'export';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  total: number;
}
