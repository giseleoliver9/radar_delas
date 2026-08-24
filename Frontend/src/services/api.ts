import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

export const getRepresentatividade = () => api.get('/representatividade');
export const getDeputados = () => api.get('/deputados');
export const getVotacoesMulheres = () => api.get('/votacoes-mulheres');
export const getRankingProposicoesMulheres = () => api.get('/parlamentares-mulheres/ranking-proposicoes');
export const getVotosMulheres = () => api.get('/parlamentares-mulheres/votos');
export const getCandidatas2026 = () => api.get('/eleicoes/candidatas-2026');
export const createElectionAlert = (data: unknown) => api.post('/eleicoes/alertas', data);
export const createCandidateRegistration = (data: unknown) => api.post('/eleicoes/cadastro-candidata', data);

export default api;
