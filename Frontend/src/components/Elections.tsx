import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Database,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  createCandidateRegistration,
  createElectionAlert,
  getCandidatas2026,
} from '../services/api';

interface Candidate2026 {
  id: string;
  nome: string;
  partido?: string;
  uf: string;
  cargo: string;
  situacao?: string;
}

const ALL_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

const ELECTION_OFFICES_2026 = [
  'Presidencia',
  'Vice-presidencia',
  'Governo estadual',
  'Vice-governo estadual',
  'Senado',
  'Deputada federal',
  'Deputada estadual',
  'Deputada distrital',
];

export const Elections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('Todos');
  const [filterOffice, setFilterOffice] = useState('Todos');
  const [sortBy, setSortBy] = useState<'name' | 'state'>('name');
  const [candidates, setCandidates] = useState<Candidate2026[]>([]);
  const [states, setStates] = useState(ALL_STATES);
  const [offices, setOffices] = useState(ELECTION_OFFICES_2026);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');

  const [alertForm, setAlertForm] = useState({
    nome: '',
    email: '',
    uf: 'Todos',
    cargo: 'Todos',
  });
  const [registrationForm, setRegistrationForm] = useState({
    nome: '',
    email: '',
    uf: 'SP',
    cargo: 'Deputada federal',
    partido: '',
    site_ou_rede: '',
  });

  useEffect(() => {
    getCandidatas2026()
      .then(res => {
        setCandidates(res.data.dados || []);
        setStates(res.data.filtros?.estados || ALL_STATES);
        setOffices(res.data.filtros?.cargos || ELECTION_OFFICES_2026);
      })
      .catch(err => console.error('Erro ao buscar candidatas 2026:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const result = candidates.filter(candidate => {
      const nameMatch = candidate.nome.toLowerCase().includes(term);
      const stateMatch = filterState === 'Todos' || candidate.uf === filterState;
      const officeMatch = filterOffice === 'Todos' || candidate.cargo === filterOffice;

      return nameMatch && stateMatch && officeMatch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'state') {
        return a.uf.localeCompare(b.uf) || a.nome.localeCompare(b.nome);
      }

      return a.nome.localeCompare(b.nome);
    });
  }, [candidates, filterOffice, filterState, searchTerm, sortBy]);

  const handleAlertSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertMessage('');

    await createElectionAlert({
      ...alertForm,
      uf: alertForm.uf === 'Todos' ? null : alertForm.uf,
      cargo: alertForm.cargo === 'Todos' ? null : alertForm.cargo,
    });
    setAlertMessage('Alerta cadastrado. Vamos avisar quando a base 2026 for atualizada.');
    setAlertForm({ nome: '', email: '', uf: 'Todos', cargo: 'Todos' });
  };

  const handleRegistrationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrationMessage('');

    await createCandidateRegistration(registrationForm);
    setRegistrationMessage('Cadastro recebido para validacao antes de ficar visivel na plataforma.');
    setRegistrationForm({
      nome: '',
      email: '',
      uf: 'SP',
      cargo: 'Deputada federal',
      partido: '',
      site_ou_rede: '',
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-secondary mb-3">Eleições 2026</h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Acompanhe candidatas mulheres por estado e cargo nas eleições gerais de 2026.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[11px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} />
            Base preparada para dados oficiais do TSE
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full lg:max-w-3xl">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar candidata..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
            >
              <option value="Todos">Estado: Todos</option>
              {states.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
            >
              <option value="Todos">Cargo: Todos</option>
              {offices.map(office => <option key={office} value={office}>{office}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative sm:col-span-2 xl:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'state')}
              className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none shadow-sm cursor-pointer"
            >
              <option value="name">Ordenar por: Nome</option>
              <option value="state">Ordenar por: Estado</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
          <Database className="text-primary mb-5" size={28} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ano eleitoral</p>
          <h3 className="text-3xl font-black text-secondary">2026</h3>
        </div>
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
          <MapPin className="text-primary mb-5" size={28} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estados filtráveis</p>
          <h3 className="text-3xl font-black text-secondary">{states.length}</h3>
        </div>
        <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
          <Users className="text-primary mb-5" size={28} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cargos de 2026</p>
          <h3 className="text-3xl font-black text-secondary">{offices.length}</h3>
        </div>
      </div>

      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCandidates.map(candidate => (
            <div key={candidate.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold text-secondary mb-2">{candidate.nome}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">
                {candidate.partido || 'Partido nao informado'} - {candidate.cargo}
              </p>
              <div className="space-y-3 text-sm font-medium text-slate-500">
                <p>{candidate.uf}</p>
                <p>{candidate.situacao || 'Aguardando situacao oficial'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <Database className="text-primary" size={30} />
          </div>
          <h3 className="text-2xl font-black text-secondary mb-3">
            {loading ? 'Carregando banco de candidatas...' : 'Banco oficial de candidatas 2026 ainda não importado'}
          </h3>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Estamos preparando a importação das candidaturas oficiais do TSE para oferecer um panorama completo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form
          onSubmit={handleAlertSubmit}
          className="bg-gradient-to-br from-white to-purple-50/30 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
            <Bell className="text-primary" size={26} />
          </div>
          <h3 className="text-3xl font-bold text-secondary mb-4">Receber atualização</h3>
          <p className="text-slate-500 leading-relaxed mb-8">
            Avise quando houver novas candidatas no recorte de estado e cargo escolhido.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Seu nome"
              className="input-field"
              value={alertForm.nome}
              onChange={(e) => setAlertForm({ ...alertForm, nome: e.target.value })}
            />
            <input
              type="email"
              placeholder="E-mail"
              className="input-field"
              required
              value={alertForm.email}
              onChange={(e) => setAlertForm({ ...alertForm, email: e.target.value })}
            />
            <select
              className="input-field"
              value={alertForm.uf}
              onChange={(e) => setAlertForm({ ...alertForm, uf: e.target.value })}
            >
              <option value="Todos">Todos os estados</option>
              {states.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select
              className="input-field"
              value={alertForm.cargo}
              onChange={(e) => setAlertForm({ ...alertForm, cargo: e.target.value })}
            >
              <option value="Todos">Todos os cargos</option>
              {offices.map(office => <option key={office} value={office}>{office}</option>)}
            </select>
          </div>

          <button className="btn-primary w-full mt-6 py-4 flex items-center justify-center gap-2">
            <Mail size={18} />
            Receber alerta
          </button>

          {alertMessage && (
            <p className="mt-4 text-sm font-bold text-success-text flex items-center gap-2">
              <CheckCircle2 size={16} />
              {alertMessage}
            </p>
          )}
        </form>

        <form
          onSubmit={handleRegistrationSubmit}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
            <UserPlus className="text-primary" size={26} />
          </div>
          <h3 className="text-3xl font-bold text-secondary mb-4">Sou candidata</h3>
          <p className="text-slate-500 leading-relaxed mb-8">
            Faça um pré-cadastro para validação e visibilidade na plataforma.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da candidata"
              className="input-field sm:col-span-2"
              required
              value={registrationForm.nome}
              onChange={(e) => setRegistrationForm({ ...registrationForm, nome: e.target.value })}
            />
            <input
              type="email"
              placeholder="E-mail de contato"
              className="input-field"
              required
              value={registrationForm.email}
              onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Partido"
              className="input-field"
              value={registrationForm.partido}
              onChange={(e) => setRegistrationForm({ ...registrationForm, partido: e.target.value })}
            />
            <select
              className="input-field"
              value={registrationForm.uf}
              onChange={(e) => setRegistrationForm({ ...registrationForm, uf: e.target.value })}
            >
              {states.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select
              className="input-field"
              value={registrationForm.cargo}
              onChange={(e) => setRegistrationForm({ ...registrationForm, cargo: e.target.value })}
            >
              {offices.map(office => <option key={office} value={office}>{office}</option>)}
            </select>
            <input
              type="url"
              placeholder="Site ou rede social"
              className="input-field sm:col-span-2"
              value={registrationForm.site_ou_rede}
              onChange={(e) => setRegistrationForm({ ...registrationForm, site_ou_rede: e.target.value })}
            />
          </div>

          <button className="btn-primary w-full mt-6 py-4 flex items-center justify-center gap-2">
            <UserPlus size={18} />
            Enviar pré-cadastro
          </button>

          {registrationMessage && (
            <p className="mt-4 text-sm font-bold text-success-text flex items-center gap-2">
              <CheckCircle2 size={16} />
              {registrationMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
