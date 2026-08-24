import React, { useState } from 'react';
import { LayoutDashboard, Vote as VoteIcon, Users, BookOpen, Menu, X, BarChart3, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar = ({ activeTab, setActiveTab }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    { id: 'votacoes', label: 'Votações', icon: VoteIcon },
    { id: 'representatividade', label: 'Elas na Política', icon: Landmark },
    { id: 'eleicoes', label: 'Eleições', icon: Users },
    { id: 'ranking', label: 'Índice Delas', icon: BarChart3 },
    { id: 'parlamentares', label: 'Buscar Parlamentar', icon: Users },
    { id: 'metodologia', label: 'Metodologia', icon: BookOpen },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => setActiveTab('inicio')}
            >
              <div className="h-12 w-auto flex items-center mr-3">
                {/* Simplified SVG version of the logo for institutional look */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105">
                  <circle cx="20" cy="20" r="20" fill="#5B21B6"/>
                  <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="20" cy="20" r="2" fill="white"/>
                  <path d="M20 28V34M17 31H23" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="20" cy="24" r="4" stroke="#F472B6" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-secondary tracking-tight">Radar Delas</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-all group ${
                  activeTab === item.id
                    ? 'text-primary'
                    : 'text-slate-500 hover:text-secondary'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-primary transition-transform duration-300 ${
                  activeTab === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-secondary focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="pt-2 pb-6 space-y-1 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold ${
                    activeTab === item.id
                      ? 'bg-primary/5 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-secondary'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <footer className="bg-white border-t border-slate-200 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-6">
            <div className="mr-3">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#5B21B6"/>
                <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="2" fill="white"/>
                <path d="M20 28V34M17 31H23" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="24" r="4" stroke="#F472B6" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-secondary">Radar Delas</span>
          </div>
          <p className="text-slate-500 max-w-sm leading-relaxed">
            Plataforma independente de transparência política focada em dados sobre representação feminina e pautas de gênero no Brasil.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-secondary mb-6">Fontes de Dados</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="https://dadosabertos.camara.leg.br/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Câmara dos Deputados</a></li>
            <li><a href="https://www12.senado.leg.br/dados-abertos" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Senado Federal</a></li>
            <li><a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">TSE</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-secondary mb-6">Atualização</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><span className="text-slate-400">Última atualização:</span></li>
            <li><span className="font-medium text-secondary">17 de Março de 2026</span></li>
            <li><button onClick={() => setActiveTab('metodologia')} className="hover:text-primary transition-colors">Ver Metodologia</button></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-400">
          © 2026 Radar Delas. Dados oficiais da Câmara, Senado e TSE.
        </p>
        <div className="flex space-x-4">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
            <Landmark size={16} />
          </div>
        </div>
      </div>
    </div>
  </footer>
);
