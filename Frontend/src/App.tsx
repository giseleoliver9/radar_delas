import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Votings } from './components/Votings';
import { Parliamentarians } from './components/Parliamentarians';
import { Ranking } from './components/Ranking';
import { Representation } from './components/Representation';
import { Elections } from './components/Elections';
import { Methodology } from './components/Methodology';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for a professional feel
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': return <Dashboard onNavigate={setActiveTab} />;
      case 'votacoes': return <Votings />;
      case 'parlamentares': return <Parliamentarians />;
      case 'ranking': return <Ranking />;
      case 'representatividade': return <Representation />;
      case 'eleicoes': return <Elections />;
      case 'metodologia': return <Methodology />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
              <circle cx="20" cy="20" r="20" fill="#5B21B6"/>
              <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
              <path d="M20 28V34M17 31H23" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="24" r="4" stroke="#F472B6" strokeWidth="2"/>
            </svg>
          </div>
          <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-full w-1/2 bg-primary"
            />
          </div>
          <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Radar Delas — Carregando</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/10 selection:text-primary">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setActiveTab={setActiveTab} />
      
      {/* Scroll to top button or other global elements could go here */}
    </div>
  );
}
