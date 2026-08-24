import React from 'react';
import { Database, ShieldCheck, Cpu, RefreshCw, FileText, Scale } from 'lucide-react';

export const Methodology = () => (
  <div className="max-w-4xl mx-auto space-y-16 py-16 px-6">
    <div className="text-center space-y-4">
      <h1 className="text-5xl font-bold text-secondary tracking-tight">Metodologia</h1>
      <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
        Transparência e rigor técnico no processamento de dados públicos.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-8">
          <Database size={28} />
        </div>
        <h3 className="text-2xl font-bold text-secondary mb-4">Fontes de Dados</h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          Consumimos dados oficiais via APIs de Dados Abertos da Câmara dos Deputados, Senado Federal e Tribunal Superior Eleitoral (TSE). Todas as informações são de domínio público e podem ser auditadas diretamente nos portais oficiais.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-8">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-2xl font-bold text-secondary mb-4">Classificação</h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          A seleção de pautas relevantes para as mulheres é feita por uma equipe técnica apartidária. Analisamos projetos que impactam direitos civis, igualdade salarial, saúde, combate à violência e representatividade política.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-8">
          <Scale size={28} />
        </div>
        <h3 className="text-2xl font-bold text-secondary mb-4">Contabilização</h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          O Índice Delas (Score) é calculado com base no comportamento parlamentar: votos favoráveis a pautas de interesse das mulheres somam pontos, enquanto votos contrários ou ausências não justificadas impactam negativamente.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-8">
          <RefreshCw size={28} />
        </div>
        <h3 className="text-2xl font-bold text-secondary mb-4">Frequência</h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          As votações são monitoradas em tempo real. O banco de dados é atualizado automaticamente a cada 24 horas, garantindo que o cidadão tenha acesso à informação mais recente disponível nos portais legislativos.
        </p>
      </div>
    </div>

    <div className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center flex-shrink-0">
          <FileText size={48} className="text-primary" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-bold">Compromisso Ético</h3>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            O Radar Delas é uma iniciativa independente e apartidária. Nossa missão é fortalecer a democracia através da transparência, sem qualquer vínculo com partidos políticos ou grupos de interesse.
          </p>
        </div>
      </div>
    </div>
  </div>
);
