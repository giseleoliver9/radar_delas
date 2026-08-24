import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Info, ShieldCheck, TrendingUp } from 'lucide-react';
import { getRankingProposicoesMulheres, getRepresentatividade, getVotacoesMulheres } from '../services/api';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

interface Proposicao {
  id: string;
  titulo: string;
  tema: string;
  ementa: string;
  ano: number;
  casa: string;
}

interface Deputy {
  id: number;
  nome: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  sexo?: 'F' | 'M' | null;
  total_proposicoes?: number;
}

const useInViewOnce = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return { ref, isVisible };
};

const CountUp = ({ end, duration = 1200, decimals = 0, start = true }: { end: number; duration?: number; decimals?: number; start?: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
      setCount(Number((easeOutCubic * end).toFixed(decimals)));
      if (percentage < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [decimals, duration, end, start]);

  return <span>{count.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
};

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [camara, setCamara] = useState({
    mulheres: 91,
    homens: 422,
    total: 513,
    percentual_mulheres: 17.7,
  });
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([]);
  const [deputados, setDeputados] = useState<Deputy[]>([]);

  useEffect(() => {
    getRepresentatividade()
      .then(res => setCamara(res.data.camara))
      .catch(err => console.error('Erro ao buscar representatividade:', err));

    getVotacoesMulheres()
      .then(res => setProposicoes(res.data.dados || []))
      .catch(err => console.error('Erro ao buscar votações:', err));

    getRankingProposicoesMulheres()
      .then(res => setDeputados(res.data.dados || []))
      .catch(err => console.error('Erro ao buscar ranking de proposições:', err));
  }, []);

  const updateDate = new Date();
  const updatedAtLong = updateDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const updatedAtMonth = updateDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const updatedAtShort = `${updateDate.toLocaleDateString('pt-BR', { day: '2-digit' })} ${updatedAtMonth.charAt(0).toUpperCase()}${updatedAtMonth.slice(1)} ${updateDate.getFullYear()}`;
  const womenInPolitics = deputados.filter(dep => dep.sexo === 'F');
  const statsReveal = useInViewOnce<HTMLDivElement>();

  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const stats = [
    {
      label: 'Mulheres na Câmara',
      numericValue: camara.percentual_mulheres,
      suffix: '%',
      decimals: 1,
      sub: `${camara.mulheres} Deputadas`,
      trend: '+1.3 p.p',
      trendColor: 'text-green-600',
      isPrimary: true,
      sparkline: "M0 15 L10 12 L20 14 L30 8 L40 10 L50 5 L60 2"
    },
    {
      label: 'Mulheres no Senado',
      numericValue: 16,
      suffix: '%',
      decimals: 1,
      sub: '13 Senadoras',
      trend: 'Estável',
      trendColor: 'text-slate-400',
      isPrimary: false,
      sparkline: "M0 10 L10 11 L20 10 L30 10 L40 11 L50 10 L60 10"
    },
    {
      label: 'Total de Deputadas',
      numericValue: camara.mulheres,
      suffix: '',
      decimals: 0,
      sub: 'De 513 cadeiras',
      trend: '+12 desde 2018',
      trendColor: 'text-green-600',
      isPrimary: false,
      sparkline: "M0 15 L15 10 L30 12 L45 5 L60 0"
    },
    {
      label: 'Total de Senadoras',
      numericValue: 13,
      suffix: '',
      decimals: 0,
      sub: 'De 81 cadeiras',
      trend: '-1 desde 2018',
      trendColor: 'text-red-600',
      isPrimary: false,
      sparkline: "M0 5 L15 8 L30 10 L45 12 L60 15"
    },
  ];

  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-white to-purple-50/50 border border-slate-100">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,rgba(91,33,182,0.05),transparent)]"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-10"
          >
            <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-primary/10 border border-slate-50">
              <svg width="96" height="96" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#5B21B6"/>
                <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="2" fill="white"/>
                <path d="M20 28V34M17 31H23" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="24" r="4" stroke="#F472B6" strokeWidth="2"/>
              </svg>
            </div>
          </motion.div>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-success-subtle text-success-text border border-success/10 text-xs font-black">
            <CheckCircle2 size={14} />
            Dados atualizados em {updatedAtShort}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-secondary"
          >
            Transparência política <br />
            <span className="text-primary">baseada em dados públicos.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            Acompanhe como o Congresso vota em pautas relacionadas às mulheres e a representatividade feminina no Brasil.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">
            <div className="flex items-center gap-2">
              <span className="text-secondary"><CountUp end={camara.total} /></span> Deputados monitorados
            </div>
            <span className="text-slate-200">•</span>
            <div className="flex items-center gap-2">
              <span className="text-secondary"><CountUp end={81} /></span> Senadores analisados
            </div>
            <span className="text-slate-200">•</span>
            <div className="flex items-center gap-2">
              <span className="text-secondary"><CountUp end={proposicoes.length} /></span> Projetos acompanhados
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => onNavigate('votacoes')} className="btn-primary">
              Ver Votações em Foco
            </button>
            <button onClick={() => onNavigate('parlamentares')} className="btn-secondary">
              Buscar Parlamentar
            </button>
          </div>
        </div>
      </header>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-center border-y border-slate-100 py-20">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Contexto</span>
            <h2 className="text-4xl md:text-[44px] leading-[1.05] font-black text-secondary mt-4 max-w-md">
              <span className="block">Representacao ainda distante da realidade</span>
              <span className="hidden">
              RepresentaÃ§Ã£o ainda distante da realidade
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 p-8 md:p-10 bg-white border border-slate-100 rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div>
              <strong className="block text-5xl md:text-[64px] leading-none font-black text-secondary">51,5%</strong>
              <span className="block mt-3 text-slate-600 text-lg font-medium">
                da populacao brasileira sao mulheres
              </span>
            </div>

            <div className="hidden md:block w-px bg-slate-200" />
            <div className="block md:hidden h-px bg-slate-200" />

            <div>
              <strong className="block text-5xl md:text-[64px] leading-none font-black highlight-number highlight-underline relative w-fit">
                {camara.percentual_mulheres}%
              </strong>
              <span className="block mt-3 text-slate-600 text-lg font-medium">
                das cadeiras da Camara sao ocupadas por mulheres
              </span>
            </div>
          </div>
          <p className="hidden">
            As mulheres representam mais de 50% da população brasileira, mas ocupam apenas{' '}
            <span className="font-black text-primary">{camara.percentual_mulheres}%</span> das cadeiras da Câmara.
          </p>
        </div>
      </motion.section>

      {/* Seção 1 – Representatividade */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6"
      >
        <div ref={statsReveal.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`stat-card bg-white p-8 rounded-2xl border border-slate-100 shadow-sm group relative flex flex-col ${statsReveal.isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                <svg width="40" height="12" className={`${stat.trendColor} opacity-40`}>
                  <path className="sparkline-path" d={stat.sparkline} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className={`text-4xl font-black mb-1 relative w-fit ${stat.isPrimary ? 'highlight-number highlight-underline' : 'text-secondary'}`}>
                <CountUp
                  end={stat.numericValue}
                  decimals={stat.decimals}
                  start={statsReveal.isVisible}
                />
                {stat.suffix}
              </h3>
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[10px] font-medium">{stat.sub}</p>
                  <div className={`text-[10px] font-bold flex items-center gap-1 ${stat.trendColor}`}>
                    {stat.trend.includes('+') && <TrendingUp size={10} />}
                    {stat.trend} desde 2018
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparativo de Gênero */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-secondary tracking-tight">Comparativo de Gênero no Congresso</h2>
                <div className="group relative">
                  <Info size={14} className="text-slate-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-secondary text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 shadow-xl">
                    Percentual calculado com base no número total de cadeiras ocupadas.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-secondary"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Distribuição de cadeiras por casa legislativa</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mulheres</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
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
                    <h3 className="text-5xl font-black text-secondary leading-none">{camara.percentual_mulheres}%</h3>
                    <span className="text-[10px] font-bold text-green-600">+1.3 p.p desde 2018</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-lg font-bold text-secondary">
                    {camara.mulheres} <span className="text-slate-300 font-medium mx-0.5">/</span> {camara.homens}
                  </div>
                  <svg width="60" height="20" className="text-primary opacity-30">
                    <path d="M0 15 L10 12 L20 14 L30 8 L40 10 L50 5 L60 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${camara.percentual_mulheres}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-primary relative z-10"
                />
                <div className="flex-1 h-full bg-slate-200" />
              </div>
            </div>

            {/* Senado */}
            <div className="md:pl-10 space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block">Senado Federal</span>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-black text-secondary leading-none">16.0%</h3>
                    <span className="text-[10px] font-bold text-slate-400">Estável</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-lg font-bold text-secondary">
                    13 <span className="text-slate-300 font-medium mx-0.5">/</span> 68
                  </div>
                  <svg width="60" height="20" className="text-slate-300">
                    <path d="M0 10 L10 11 L20 10 L30 10 L40 11 L50 10 L60 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '16.0%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-primary relative z-10"
                />
                <div className="flex-1 h-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Seção 2 – Votações em Foco (ainda mock) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-4">Votações em Foco</h2>
            <p className="text-slate-500">Acompanhe os projetos mais relevantes para os direitos das mulheres.</p>
          </div>
          <button onClick={() => onNavigate('votacoes')} className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Ver todas <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {proposicoes.slice(0, 3).map((project) => (
            <div key={project.id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-md w-fit">
                    {project.tema}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{project.casa}</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {project.ano}
                </span>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">{project.titulo}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">{project.ementa}</p>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{project.casa}</span>
                <button onClick={() => onNavigate('votacoes')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Seção 3 – Mulheres na Política */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-4">Mulheres na Política</h2>
            <p className="text-slate-500 font-medium">Deputadas com atuação mapeada em proposições relacionadas às mulheres.</p>
          </div>
          <button onClick={() => onNavigate('ranking')} className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Ver base completa <ArrowRight size={20} />
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deputada</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partido / UF</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Projetos para mulheres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {womenInPolitics.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={p.urlFoto}
                        alt={p.nome}
                        className="w-10 h-10 rounded-lg object-cover grayscale-[0.2]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-secondary">{p.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-500">{p.siglaPartido} / {p.siglaUf}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-primary/10 text-primary">
                      {p.total_proposicoes || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Sobre o Radar Delas */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-100"
      >
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-4">Sobre o Radar Delas</h2>
          <p className="text-xl text-slate-500 font-medium">Por que esta plataforma existe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">01. A Dor</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Apesar de o Brasil possuir dados públicos detalhados sobre votações e representatividade política, essas informações são fragmentadas, técnicas e difíceis de interpretar.
            </p>
          </div>
          <div className="space-y-6 md:border-l md:border-slate-100 md:pl-16">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">02. O Problema</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              A falta de organização e clareza transforma dados públicos em informação inacessível, dificultando a tomada de decisão consciente.
            </p>
          </div>
          <div className="space-y-6 md:border-l md:border-slate-100 md:pl-16">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">03. A Solução</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              O Radar Delas organiza dados oficiais da Câmara, Senado e TSE em visualizações claras, permitindo que qualquer pessoa acompanhe a representatividade feminina no Congresso.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Transparência e Fontes */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="max-w-6xl mx-auto px-6 py-24 bg-slate-50/30 rounded-[3rem] border border-slate-100"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-bold text-secondary mb-4">Transparência e Fontes</h2>
              <p className="text-xl text-slate-500 font-medium">Todos os dados exibidos nesta plataforma são públicos e oficiais.</p>
            </div>
            <ul className="space-y-6">
              {[
                { name: 'Câmara dos Deputados', url: 'dadosabertos.camara.leg.br' },
                { name: 'Senado Federal', url: 'dadosabertos.senado.leg.br' },
                { name: 'Tribunal Superior Eleitoral (TSE)', url: 'dadosabertos.tse.jus.br' },
                { name: 'IBGE', url: 'ibge.gov.br' },
              ].map((source, i) => (
                <li key={i} className="flex items-center justify-between py-4 border-b border-slate-100 group">
                  <span className="font-bold text-secondary">{source.name}</span>
                  <a href={`https://${source.url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
                    {source.url}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Última atualização: <span className="text-secondary">{updatedAtLong}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-secondary">Metodologia</h3>
            </div>
            <div className="space-y-8">
              {[
                'Os projetos relacionados às mulheres são identificados com base em palavras-chave e categorização temática.',
                'Os votos são contabilizados com base nos registros oficiais das casas legislativas, sem qualquer alteração manual.',
                'Nenhum dado é alterado ou interpretado além das informações públicas disponíveis, garantindo isenção total.',
              ].map((text, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-primary font-black text-xl">0{i + 1}</div>
                  <p className="text-slate-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('metodologia')}
              className="w-full py-4 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              Ver Metodologia Completa
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
