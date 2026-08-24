import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, FileText, Search, Trophy, Venus, X } from 'lucide-react';
import { getRankingProposicoesMulheres, getVotosMulheres } from '../services/api';

interface Proposicao {
  id: string;
  titulo: string;
  tema: string;
  ementa: string;
  ano: number;
  casa: string;
}

interface RankingItem {
  id: number;
  nome: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  sexo?: 'F' | 'M' | null;
  total_proposicoes: number;
  temas: Record<string, number>;
  anos: Record<string, number>;
  proposicoes: Proposicao[];
}

interface VoteRankingItem {
  id: number;
  nome: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  sim: number;
  nao: number;
  abstencao: number;
  outros: number;
  total_votos: number;
}

const genderLabel = (sexo?: string | null) => {
  if (sexo === 'F') return 'Feminino';
  if (sexo === 'M') return 'Masculino';
  return 'Não informado';
};

const topTheme = (item: RankingItem) => {
  const [theme] = Object.entries(item.temas || {}).sort((a, b) => b[1] - a[1])[0] || [];
  return theme || 'Tema não informado';
};

export const Ranking = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [voteRanking, setVoteRanking] = useState<VoteRankingItem[]>([]);
  const [voteObservation, setVoteObservation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRankingProposicoesMulheres()
      .then(res => {
        setRanking(res.data.dados || []);
        setTotalProjects(res.data.total_proposicoes_analisadas || 0);
      })
      .catch(err => {
        console.error('Erro ao buscar ranking de proposições:', err);
        setError('Não foi possível carregar o ranking de atuação por mulheres.');
      })
      .finally(() => setLoading(false));

    getVotosMulheres()
      .then(res => {
        setVoteRanking(res.data.dados || []);
        setVoteObservation(res.data.observacao || '');
      })
      .catch(err => console.error('Erro ao buscar votos nominais:', err));
  }, []);

  const states = ['Todos', ...Array.from(new Set(ranking.map(p => p.siglaUf).filter(Boolean)))].sort();
  const womenInRanking = ranking.filter(item => item.sexo === 'F').length;
  const topPerformer = ranking[0];

  const filteredRanking = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return ranking.filter(item => {
      const searchMatch =
        item.nome.toLowerCase().includes(searchLower) ||
        item.siglaPartido?.toLowerCase().includes(searchLower) ||
        item.siglaUf?.toLowerCase().includes(searchLower) ||
        topTheme(item).toLowerCase().includes(searchLower);
      const stateMatch = filterState === 'Todos' || item.siglaUf === filterState;
      return searchMatch && stateMatch;
    });
  }, [ranking, searchTerm, filterState]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-3">Índice Delas</h1>
          <p className="text-slate-500 text-lg">
            Ranking real de parlamentares com mais proposições relacionadas às mulheres.
          </p>
          {loading && (
            <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse mt-2">
              Cruzando proposições e autores oficiais da Câmara...
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nome, partido, UF ou tema..."
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/10 shadow-sm w-full md:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="appearance-none pl-4 pr-12 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10 shadow-sm cursor-pointer"
            >
              {states.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os Estados' : s}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {(searchTerm !== '' || filterState !== 'Todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterState('Todos');
              }}
              className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors"
            >
              <X size={16} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-white p-12 rounded-[2rem] border border-danger/10 text-center">
          <AlertCircle size={32} className="text-danger mx-auto mb-4" />
          <p className="font-bold text-secondary">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md shadow-slate-200/50">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={24} className="text-primary" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Projetos analisados</p>
              <h3 className="text-4xl font-black text-secondary">{loading ? '...' : totalProjects}</h3>
              <p className="mt-4 text-sm text-slate-500">Proposições relacionadas às mulheres.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md shadow-slate-200/50">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <Trophy size={24} className="text-primary" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Maior atuação</p>
              <h3 className="text-3xl font-black text-secondary truncate">{loading ? '...' : topPerformer?.nome || '-'}</h3>
              <p className="mt-4 text-sm text-slate-500">
                {topPerformer ? `${topPerformer.total_proposicoes} proposições mapeadas.` : 'Aguardando dados.'}
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-md shadow-slate-200/50">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <Venus size={24} className="text-primary" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Mulheres no ranking</p>
              <h3 className="text-4xl font-black text-secondary">{loading ? '...' : womenInRanking}</h3>
              <p className="mt-4 text-sm text-slate-500">Parlamentares mulheres com proposições mapeadas.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-md shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Pos.</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Parlamentar</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Partido / UF</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Gênero</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Tema mais frequente</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Projetos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-8 py-6" colSpan={6}>
                          <div className="h-8 bg-slate-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredRanking.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group align-top">
                        <td className="px-8 py-6 font-bold text-slate-400">#{index + 1}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <img
                              src={item.urlFoto}
                              alt={item.nome}
                              className="w-10 h-10 rounded-full object-cover mr-4 border border-slate-100 shadow-sm bg-slate-50"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-secondary group-hover:text-primary transition-colors">{item.nome}</span>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {item.proposicoes?.[0]?.titulo || 'Sem projeto recente'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {item.siglaPartido || '-'}
                          </span>
                          <span className="ml-2 text-sm text-slate-400">{item.siglaUf || '-'}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-medium text-slate-500">{genderLabel(item.sexo)}</td>
                        <td className="px-8 py-6 text-sm font-medium text-slate-500">{topTheme(item)}</td>
                        <td className="px-8 py-6 text-right">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-primary/10 text-primary">
                            {item.total_proposicoes}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-md shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-2xl font-bold text-secondary mb-2">Votos nominais em proposições mapeadas</h2>
              <p className="text-sm text-slate-500">
                {voteObservation || 'Contagem bruta de votos SIM/NÃO nas votações encontradas para proposições relacionadas às mulheres.'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Parlamentar</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Partido / UF</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Sim</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Não</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Abstenção</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {voteRanking.length > 0 ? (
                    voteRanking.slice(0, 20).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <img
                              src={item.urlFoto}
                              alt={item.nome}
                              className="w-10 h-10 rounded-full object-cover mr-4 border border-slate-100 shadow-sm bg-slate-50"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-bold text-secondary">{item.nome}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {item.siglaPartido || '-'}
                          </span>
                          <span className="ml-2 text-sm text-slate-400">{item.siglaUf || '-'}</span>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-success-text">{item.sim}</td>
                        <td className="px-8 py-6 text-right font-black text-danger-text">{item.nao}</td>
                        <td className="px-8 py-6 text-right font-black text-slate-400">{item.abstencao}</td>
                        <td className="px-8 py-6 text-right font-black text-secondary">{item.total_votos}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-10 text-center text-sm font-medium text-slate-500" colSpan={6}>
                        Nenhuma votação nominal encontrada para a amostra de proposições mapeadas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
