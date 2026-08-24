import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, FileText, Search, Users, Venus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeputados, getRankingProposicoesMulheres } from '../services/api';

interface Deputy {
  id: number;
  nome: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  sexo?: 'F' | 'M' | null;
}

interface Proposicao {
  id: string;
  titulo: string;
  tema: string;
  ano: number;
}

interface AuthorStats {
  total_proposicoes: number;
  temas: Record<string, number>;
  proposicoes: Proposicao[];
}

const genderLabel = (sexo?: string | null) => {
  if (sexo === 'F') return 'Feminino';
  if (sexo === 'M') return 'Masculino';
  return 'Não informado';
};

export const Parliamentarians = () => {
  const [deputies, setDeputies] = useState<Deputy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [authorStats, setAuthorStats] = useState<Record<number, AuthorStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDeputados()
      .then(res => {
        const data = (res.data.dados || [])
          .filter((dep: Deputy) => dep.sexo === 'F')
          .sort((a: Deputy, b: Deputy) => a.nome.localeCompare(b.nome));
        setDeputies(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch(err => {
        console.error('Erro ao buscar deputados:', err);
        setError('Não foi possível carregar os deputados da Câmara.');
      })
      .finally(() => setLoading(false));

    getRankingProposicoesMulheres()
      .then(res => {
        const stats: Record<number, AuthorStats> = {};
        (res.data.dados || []).forEach((item: AuthorStats & { id: number }) => {
          stats[item.id] = {
            total_proposicoes: item.total_proposicoes,
            temas: item.temas,
            proposicoes: item.proposicoes,
          };
        });
        setAuthorStats(stats);
      })
      .catch(err => console.error('Erro ao buscar atuação por mulheres:', err));
  }, []);

  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return deputies.filter(dep =>
      dep.nome.toLowerCase().includes(term) ||
      dep.siglaPartido?.toLowerCase().includes(term) ||
      dep.siglaUf?.toLowerCase().includes(term)
    );
  }, [deputies, searchTerm]);

  const selectedDeputy = useMemo(
    () => deputies.find(dep => dep.id === selectedId) ?? null,
    [deputies, selectedId]
  );
  const selectedStats = selectedDeputy ? authorStats[selectedDeputy.id] : null;
  const selectedTopTheme = selectedStats
    ? Object.entries(selectedStats.temas || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-3">Mulheres Parlamentares</h1>
          <p className="text-slate-500 text-lg">Consulte dados oficiais dos deputados federais em exercício.</p>
          {loading && (
            <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse mt-2">
              Buscando dados reais da Câmara...
            </p>
          )}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Nome, partido ou estado da deputada..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!loading && (
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {filteredList.length} deputadas encontradas
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-white p-12 rounded-[2rem] border border-danger/10 text-center">
          <AlertCircle size={32} className="text-danger mx-auto mb-4" />
          <p className="font-bold text-secondary">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full h-28 rounded-[2rem] border border-slate-100 bg-white animate-pulse" />
              ))
            ) : (
              filteredList.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => setSelectedId(dep.id)}
                  className={`w-full flex items-center p-6 rounded-[2rem] border transition-all shadow-sm ${
                    selectedId === dep.id
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                  }`}
                >
                  <img
                    src={dep.urlFoto}
                    alt={dep.nome}
                    className="w-14 h-14 rounded-full object-cover mr-4 border border-slate-100 shadow-sm bg-slate-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-bold text-secondary leading-tight truncate">{dep.nome}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {dep.siglaPartido || 'Partido'} - {dep.siglaUf || 'UF'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <span className="badge badge-neutral">{genderLabel(dep.sexo)}</span>
                    <span className="text-[10px] font-black text-primary">
                      {authorStats[dep.id]?.total_proposicoes || 0} projetos
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2 sticky top-28">
            <AnimatePresence mode="wait">
              {selectedDeputy ? (
                <motion.div
                  key={selectedDeputy.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50"
                >
                  <div className="p-12 bg-gradient-to-br from-white to-slate-50/50 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <img
                        src={selectedDeputy.urlFoto}
                        alt={selectedDeputy.nome}
                        className="w-40 h-40 rounded-[2rem] object-cover border-4 border-white shadow-xl bg-slate-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          <span className="badge badge-neutral">
                            {selectedDeputy.siglaPartido || 'Partido não informado'}
                          </span>
                          <span className="badge badge-neutral">
                            {selectedDeputy.siglaUf || 'UF não informada'}
                          </span>
                          <span className="badge badge-neutral">{genderLabel(selectedDeputy.sexo)}</span>
                        </div>
                        <h2 className="text-4xl font-bold text-secondary mb-2 leading-tight">{selectedDeputy.nome}</h2>
                        <p className="text-slate-500 font-medium">
                          Dados oficiais da Câmara dos Deputados para a legislatura em exercício.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Projetos para mulheres</p>
                      <p className="text-xl font-black text-secondary">{selectedStats?.total_proposicoes || 0}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                        <Venus size={20} className="text-primary" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tema mais frequente</p>
                      <p className="text-xl font-black text-secondary">{selectedTopTheme || '-'}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ID Câmara</p>
                      <p className="text-xl font-black text-secondary">{selectedDeputy.id}</p>
                    </div>
                  </div>

                  <div className="mx-12 mb-8">
                    <h3 className="text-2xl font-bold text-secondary mb-6">Proposições relacionadas às mulheres</h3>
                    {selectedStats?.proposicoes?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStats.proposicoes.map(proposicao => (
                          <div key={proposicao.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{proposicao.tema}</span>
                            <h4 className="font-bold text-secondary mt-2">{proposicao.titulo}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">{proposicao.ano}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-500">
                          Nenhuma proposição relacionada às mulheres foi encontrada na base mapeada.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mx-12 mb-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Fonte</p>
                    <a
                      href={`https://www.camara.leg.br/deputados/${selectedDeputy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Ver perfil oficial na Câmara &rarr;
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                    <Users size={48} className="text-slate-200" />
                  </div>
                  <p className="text-xl font-bold text-slate-400">Selecione uma deputada para ver o perfil</p>
                  <p className="text-sm text-slate-300 mt-2">Clique em um dos cards à esquerda</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
