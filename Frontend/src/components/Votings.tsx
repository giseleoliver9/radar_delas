import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, CheckCircle2, XCircle, MinusCircle, Search, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVotacoesMulheres } from '../services/api';

interface Proposicao {
  id: string;
  titulo: string;
  tema: string;
  ementa: string;
  ano: number;
  casa: string;
}

const DEFAULT_THEMES = [
  'Violência Doméstica',
  'Igualdade Salarial',
  'Saúde da Mulher',
  'Licença Maternidade',
  'Educação',
  'Trabalho',
  'Direitos da Mulher',
];

const DEFAULT_YEARS = Array.from(
  { length: new Date().getFullYear() - 2020 + 1 },
  (_, index) => String(new Date().getFullYear() - index)
);

export const Votings = () => {
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Proposicao | null>(null);
  const [filterTheme, setFilterTheme] = useState('Todos');
  const [filterHouse, setFilterHouse] = useState('Todas');
  const [filterYear, setFilterYear] = useState('Todos');
  const [quickFilter, setQuickFilter] = useState('Recentes');

  useEffect(() => {
    getVotacoesMulheres()
      .then(res => {
        setProposicoes(res.data.dados);
      })
      .catch(err => console.error('Erro ao buscar votações:', err))
      .finally(() => setLoading(false));
  }, []);

  const themes = ['Todos', ...Array.from(new Set([...DEFAULT_THEMES, ...proposicoes.map(p => p.tema).filter(Boolean)]))];
  const houses = ['Todas', ...Array.from(new Set(['Câmara', ...proposicoes.map(p => p.casa).filter(Boolean)]))];
  const years = ['Todos', ...Array.from(new Set([...DEFAULT_YEARS, ...proposicoes.map(p => p.ano?.toString()).filter(Boolean)]))];

  const filteredProjects = useMemo(() => {
    let filtered = proposicoes.filter(p => {
      const themeMatch = filterTheme === 'Todos' || p.tema === filterTheme;
      const houseMatch = filterHouse === 'Todas' || p.casa === filterHouse;
      const yearMatch = filterYear === 'Todos' || p.ano?.toString() === filterYear;
      return themeMatch && houseMatch && yearMatch;
    });

    if (quickFilter === 'Recentes') {
      filtered = [...filtered].sort((a, b) => (b.ano || 0) - (a.ano || 0));
    } else if (quickFilter === 'Mais relevantes') {
      // Ordena por tema prioritário
      const prioridade: Record<string, number> = {
        'Violência Doméstica': 1,
        'Igualdade Salarial': 2,
        'Saúde da Mulher': 3,
        'Licença Maternidade': 4,
        'Direitos da Mulher': 5,
      };
      filtered = [...filtered].sort((a, b) => 
        (prioridade[a.tema] || 99) - (prioridade[b.tema] || 99)
      );
    } else if (quickFilter === 'Mais comentados') {
      // Ordena por ID decrescente (proposições mais recentes tendem a ter mais atividade)
      filtered = [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
    }

    return filtered;
  }, [proposicoes, filterTheme, filterHouse, filterYear, quickFilter]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-3">Votações em Foco</h1>
          <p className="text-slate-500 text-lg">Acompanhe os projetos de lei mais relevantes para as mulheres.</p>
          {loading && (
            <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse mt-2">
              Buscando proposições reais da Câmara...
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-100/50 p-1 rounded-xl flex self-start md:self-end">
            {['Recentes', 'Mais relevantes', 'Mais comentados'].map((f) => (
              <button
                key={f}
                onClick={() => setQuickFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  quickFilter === f
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="appearance-none pl-4 pr-12 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
              >
                {themes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterHouse}
                onChange={(e) => setFilterHouse(e.target.value)}
                className="appearance-none pl-4 pr-12 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
              >
                {houses.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="appearance-none pl-4 pr-12 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 space-y-6">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full p-8 rounded-[2rem] border border-slate-100 bg-white animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-6" />
                <div className="h-6 bg-slate-100 rounded w-2/3 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
              </div>
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-8 rounded-[2rem] border transition-all shadow-sm ${
                  selectedProject?.id === project.id
                    ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {project.tema}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {project.casa}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-secondary mb-4 leading-tight">{project.titulo}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{project.ementa}</p>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Landmark size={12} /> {project.casa}
                  </span>
                  <span>{project.ano}</span>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={24} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">Nenhum projeto encontrado</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tente remover filtros ou buscar por outro tema.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 sticky top-28">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50"
              >
                <div className="p-12">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
                      {selectedProject.tema}
                    </span>
                    <span className="text-slate-200">•</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedProject.casa}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-secondary mb-6 leading-tight">{selectedProject.titulo}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed mb-10">{selectedProject.ementa}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Ano', value: selectedProject.ano },
                      { label: 'Casa', value: selectedProject.casa },
                      { label: 'ID', value: selectedProject.id },
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                        <p className="font-bold text-secondary">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Fonte</p>
                    <a
                      href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${selectedProject.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Ver tramitação completa na Câmara &rarr;
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <Landmark size={48} className="text-slate-200" />
                </div>
                <p className="text-xl font-bold text-slate-400">Selecione um projeto para ver os detalhes</p>
                <p className="text-sm text-slate-300 mt-2">Clique em um dos cards à esquerda</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
