import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp, Map as MapIcon, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockHistoricalData } from '../mockData';
import { getDeputados, getRepresentatividade } from '../services/api';

interface CamaraStats {
  women: number;
  men: number;
  total: number;
  percentage: number;
}

interface StateRepresentation {
  uf: string;
  women: number;
  men: number;
  total: number;
  percentage: number;
}

interface Deputy {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto?: string;
  uri?: string;
  sexo?: 'F' | 'M' | null;
}

export const Representation = () => {
  const data = mockHistoricalData;

  const [camara, setCamara] = useState<CamaraStats>({
    women: 91,
    men: 422,
    total: 513,
    percentage: 17.7,
  });
  const [statesRepresentation, setStatesRepresentation] = useState<StateRepresentation[]>([]);
  const [womenDeputies, setWomenDeputies] = useState<Deputy[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Senado ainda é mock (fase 2)
  const senado = { women: 13, men: 68, total: 81, percentage: 16.0 };

  useEffect(() => {
    Promise.all([getRepresentatividade(), getDeputados()])
      .then(([representatividadeRes, deputadosRes]) => {
        const c = representatividadeRes.data.camara;
        setCamara({
          women: c.mulheres,
          men: c.homens,
          total: c.total,
          percentage: c.percentual_mulheres,
        });
        setStatesRepresentation((c.por_estado || []).map((estado: any) => ({
          uf: estado.uf,
          women: estado.mulheres,
          men: estado.homens,
          total: estado.total,
          percentage: estado.percentual_mulheres,
        })));
        setWomenDeputies((deputadosRes.data.dados || [])
          .filter((deputado: Deputy) => deputado.sexo === 'F')
          .sort((a: Deputy, b: Deputy) => a.nome.localeCompare(b.nome)));
      })
      .catch(err => console.error('Erro ao buscar representatividade:', err))
      .finally(() => setLoading(false));
  }, []);

  const indicators = [
    { label: 'Mulheres na Câmara (%)', value: `${camara.percentage}%`, sub: 'Legislatura 2023-2027' },
    { label: 'Mulheres no Senado (%)', value: `${senado.percentage}%`, sub: 'Legislatura 2023-2027' },
    { label: 'Total de deputadas federais', value: loading ? '...' : camara.women, sub: 'De 513 cadeiras' },
    { label: 'Total de senadoras', value: senado.women, sub: 'De 81 cadeiras' },
  ];
  const highestState = statesRepresentation[0];
  const lowestState = [...statesRepresentation]
    .filter(estado => estado.total > 0)
    .sort((a, b) => a.percentage - b.percentage || a.uf.localeCompare(b.uf))[0];
  const selectedStateData = statesRepresentation.find(estado => estado.uf === selectedState);
  const selectedStateWomen = selectedState
    ? womenDeputies.filter(deputado => deputado.siglaUf === selectedState)
    : [];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-20">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-secondary tracking-tight">Representatividade Feminina</h1>
        <p className="text-slate-500 text-xl font-medium max-w-2xl">
          Panorama atual da participação das mulheres no Congresso Nacional.
        </p>
        {loading && (
          <p className="text-xs text-primary font-bold uppercase tracking-widest animate-pulse">
            Buscando dados reais da Câmara...
          </p>
        )}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicators.map((item, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">{item.label}</p>
            <h2 className="text-4xl font-black text-secondary mb-2">{item.value}</h2>
            <p className="text-slate-400 text-xs font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Comparativo */}
      <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-secondary tracking-tight">Comparativo de Gênero no Congresso</h3>
            <p className="text-xs text-slate-400 font-medium">Distribuição de cadeiras por casa legislativa</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mulheres</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Homens</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:divide-x md:divide-slate-100">
          {/* Câmara */}
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block">Câmara dos Deputados</span>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black text-secondary leading-none">
                    {loading ? '...' : `${camara.percentage}%`}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-secondary">
                  {camara.women} <span className="text-slate-300 font-medium mx-0.5">/</span> {camara.men}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mulheres / Homens</div>
              </div>
            </div>
            <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${camara.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary relative z-10"
              />
              <div className="flex-1 h-full bg-[#CBD5E1]" />
            </div>
          </div>

          {/* Senado */}
          <div className="md:pl-10 space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block">Senado Federal</span>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black text-secondary leading-none">{senado.percentage}%</h4>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-secondary">
                  {senado.women} <span className="text-slate-300 font-medium mx-0.5">/</span> {senado.men}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mulheres / Homens</div>
              </div>
            </div>
            <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${senado.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary relative z-10"
              />
              <div className="flex-1 h-full bg-[#CBD5E1]" />
            </div>
          </div>
        </div>
      </div>

      {/* Evolução Histórica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-primary" size={32} />
          </div>
          <h3 className="text-3xl font-bold text-secondary">Evolução Histórica</h3>
          <p className="text-slate-500 leading-relaxed text-lg">
            Apesar do crescimento constante na última década, o Brasil ainda ocupa posições inferiores na média global de representação feminina no legislativo. O salto de 2018 para 2022 reflete mudanças nas regras de financiamento e tempo de TV.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B21B6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#5B21B6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Area type="monotone" dataKey="percentage" stroke="#5B21B6" strokeWidth={4} fillOpacity={1} fill="url(#colorPct)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição Geográfica */}
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-8">
              <MapIcon size={28} className="text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-secondary mb-6">Distribuição Geográfica</h3>
            <p className="text-slate-500 leading-relaxed mb-10 text-lg">
              A representatividade varia drasticamente entre as regiões do país.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="font-bold text-secondary">Maior % na Câmara</span>
                <span className="text-primary font-black text-xl">
                  {highestState ? `${highestState.uf} (${highestState.percentage}%)` : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="font-bold text-secondary">Menor % na Câmara</span>
                <span className="text-danger-text font-black text-xl">
                  {lowestState ? `${lowestState.uf} (${lowestState.percentage}%)` : '...'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 min-h-[420px] relative">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h4 className="text-xl font-black text-secondary">Ranking por UF</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Dados oficiais da Câmara
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {statesRepresentation.length || 0} UFs
              </span>
            </div>

            <div className="space-y-4 max-h-[330px] overflow-y-auto pr-2">
              {statesRepresentation.map((estado) => (
                <button
                  key={estado.uf}
                  type="button"
                  onClick={() => setSelectedState(estado.uf)}
                  className="w-full grid grid-cols-[42px_1fr_68px] gap-3 items-center text-left p-2 -mx-2 rounded-2xl transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={`Ver deputadas de ${estado.uf}`}
                >
                  <span className="text-sm font-black text-secondary">{estado.uf}</span>
                  <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${estado.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-right text-sm font-black text-primary">{estado.percentage}%</span>
                  <span className="col-start-2 col-span-2 text-[11px] font-medium text-slate-400 -mt-2">
                    {estado.women} mulheres de {estado.total} cadeiras
                  </span>
                </button>
              ))}

              {!loading && statesRepresentation.length === 0 && (
                <div className="h-48 flex items-center justify-center text-center">
                  <p className="text-sm font-bold text-slate-400">
                    Não foi possível carregar a distribuição por UF.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedState && (
        <div
          className="fixed inset-0 z-50 bg-secondary/40 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Deputadas de ${selectedState}`}
          onClick={() => setSelectedState(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-8 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">
                  {selectedStateData?.percentage ?? 0}% de representatividade
                </p>
                <h4 className="text-3xl font-black text-secondary">
                  Deputadas de {selectedState}
                </h4>
                <p className="text-sm font-medium text-slate-500 mt-2">
                  {selectedStateWomen.length} mulheres de {selectedStateData?.total ?? 0} cadeiras federais
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedState(null)}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-secondary hover:bg-slate-100 transition-colors"
                aria-label="Fechar lista"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
              {selectedStateWomen.map((deputada) => (
                <div
                  key={deputada.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={deputada.urlFoto}
                      alt={deputada.nome}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-white shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="font-black text-secondary truncate">{deputada.nome}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {deputada.siglaPartido} / {deputada.siglaUf}
                      </p>
                    </div>
                  </div>
                  {deputada.uri && (
                    <a
                      href={deputada.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                      aria-label={`Abrir perfil de ${deputada.nome} na Câmara`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))}

              {selectedStateWomen.length === 0 && (
                <div className="py-14 text-center">
                  <p className="text-sm font-bold text-slate-400">
                    Nenhuma deputada federal encontrada para este estado na legislatura atual.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
