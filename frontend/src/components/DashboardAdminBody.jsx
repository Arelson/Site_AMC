import './DashboardAdminBody.css';
import { useState } from 'react';
import VisaoGeral from './elements/VisaoGeral';
import GestaoConteudo from './elements/GestaoConteudo';
import MinhaConta from './elements/MinhaConta';



export default function DashboardAdminBody() {
  const [visaoGeral, setVisaoGeral] = useState(true);
  const [gestaoConteudo, setGestaoConteudo] = useState(false);
  const [minhaConta, setMinhaConta] = useState(false);



  const handleVisaoGeral = (e) => {
    e.preventDefault();
    setVisaoGeral(true);
    setGestaoConteudo(false);
    setMinhaConta(false);
  }

  const handleGestaoConteudo = (e) => {
    e.preventDefault();
    setVisaoGeral(false);
    setGestaoConteudo(true);
    setMinhaConta(false);
  }

  const handleMinhaConta = (e) => {
    e.preventDefault();
    setVisaoGeral(false);
    setGestaoConteudo(false);
    setMinhaConta(true);
  }

  return (
    <div className="dashboard-adm-container">
      <aside className="dashboard-adm-aside">
        <div className="dashboard-adm-aside-title">
          <div className="dashboard-adm-aside-title-logo">
            A
          </div>
          <div className='dashboard-adm-aside-title-content'>
            <strong className='dashboard-adm-aside-title-content-name'>Administrador AMC</strong>
            <span>ADMINISTRADOR</span>
          </div>
        </div>
        <nav className="dashboard-adm-aside-nav">
          <a href="#" onClick={handleVisaoGeral} className={`dashboard-adm-aside-nav-a ${visaoGeral ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className='dashboard-adm-aside-nav-geral'>Visão Geral</p>
          </a>
          <a href="#" onClick={handleGestaoConteudo} className={`dashboard-adm-aside-nav-a ${gestaoConteudo ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <path d="M4 8h16"></path>
              <path d="M8 14h8"></path>
              <path d="M8 18h8"></path>
            </svg>            
            <p className='dashboard-adm-aside-nav-conteudo'>Gestão</p>
          </a>
          
          <a href="#" onClick={handleMinhaConta} className={`dashboard-adm-aside-nav-a ${minhaConta ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 2-9.6 9.6"></path>
              <circle cx="7.5" cy="15.5" r="5.5"></circle>
              <path d="m15.5 7.5 2.3 2.3"></path>
              <path d="m19 4 2.1 2.1"></path>
            </svg>
            <p className='dashboard-adm-aside-nav-conta'>Minha Conta</p>
          </a>
        </nav>
        
      </aside>
      <main className="dashboard-adm-main">
        {visaoGeral && <VisaoGeral />}
        {gestaoConteudo && <GestaoConteudo adm={true} />}
        {minhaConta && <MinhaConta />}      
      </main>
    </div>
  );
}