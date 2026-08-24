export interface Stat {
  label: string;
  value: string | number;
  percentage?: number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Project {
  id: string;
  title: string;
  theme: string;
  summary: string;
  date: string;
  status: 'Aprovado' | 'Rejeitado' | 'Em tramitação';
  house: 'Câmara' | 'Senado';
  year: number;
}

export interface Vote {
  parliamentarianId: string;
  name: string;
  party: string;
  state: string;
  vote: 'Sim' | 'Não' | 'Abstenção';
}

export interface Parliamentarian {
  id: string;
  name: string;
  party: string;
  state: string;
  photoUrl: string;
  mandates: number;
  gender: 'Feminino' | 'Masculino';
  favorableVotes: number;
  againstVotes: number;
  abstentions: number;
  score: number; // 0-100
  commissions: string[];
  projects: { id: string; title: string; theme: string }[];
  attendanceRate: number; // Percentage (0-100)
  totalAnalyzedVotes: number;
}

export interface HistoricalData {
  year: number;
  percentage: number;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  state: string;
  city: string;
  office: string;
  votes: number;
  status: string;
}
