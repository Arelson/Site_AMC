import './DashboardMemberBody.css';
import { useState } from 'react';
import VisaoGeral from './elements/VisaoGeral';
import GestaoConteudo from './elements/GestaoConteudo';
import CriarPost from './elements/CriarPost';
import EditarPost from './elements/EditarPost';



export default function DashboardAdminBody() {
  const [visaoGeral, setVisaoGeral] = useState(true);
  const [gestaoConteudo, setGestaoConteudo] = useState(false);
  const [minhaConta, setMinhaConta] = useState(false);
  const [criarPost, setCriarPost] = useState(false);
  const [editarPost, setEditarPost] = useState(false);
  const [postEditandoId, setPostEditandoId] = useState(null);
  const nomeCompleto = localStorage.getItem('nomeCompleto');
  const primeiroNome =nomeCompleto? nomeCompleto.split(' ')[0]: '';
  const primeiraLetra = primeiroNome.charAt(0).toUpperCase();
  const ultimoNome =nomeCompleto? nomeCompleto.split(' ')[nomeCompleto.split(' ').length - 1]: '';  


  const handleVisaoGeral = (e) => {
    e.preventDefault();
    setVisaoGeral(true);
    setGestaoConteudo(false);
    setMinhaConta(false);
    setCriarPost(false);
    setEditarPost(false);
    setPostEditandoId(null);
  }

  const handleGestaoConteudo = (e) => {
    e.preventDefault();
    setVisaoGeral(false);
    setGestaoConteudo(true);
    setMinhaConta(false);
    setCriarPost(false);
    setEditarPost(false);
    setPostEditandoId(null);
  }

  const handleMinhaConta = (e) => {
    e.preventDefault();
    setVisaoGeral(false);
    setGestaoConteudo(false);
    setMinhaConta(true);
    setCriarPost(false);
    setEditarPost(false);
    setPostEditandoId(null);
  }

  const handleCriarPost = (e) => {
    e.preventDefault();
    setVisaoGeral(false);
    setGestaoConteudo(false);
    setMinhaConta(false);
    setCriarPost(true);
    setEditarPost(false);
    setPostEditandoId(null);
  }

  const handleEditarPost = (id) => {
    setVisaoGeral(false);
    setGestaoConteudo(false);
    setMinhaConta(false);
    setCriarPost(false);
    setEditarPost(true);
    setPostEditandoId(id);
  }

  return (
    <div className="dashboard-member-container">
      <aside className="dashboard-member-aside">
        <div className="dashboard-member-aside-title">
          <div className="dashboard-member-aside-title-logo">
            {primeiraLetra}
          </div>
          <div className='dashboard-member-aside-title-content'>
            <strong className="dashboard-member-aside-title-content-name">Dr(a) {primeiroNome} {ultimoNome}</strong>
            <strong className="dashboard-member-aside-title-content-resp">Dr(a) {primeiroNome}</strong>
            <span>Membro</span>
          </div>
        </div>
        <nav className="dashboard-member-aside-nav">
          <a href="#" onClick={handleVisaoGeral} className={`dashboard-member-aside-nav-a ${visaoGeral ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className="dashboard-member-aside-nav-geral">Visão Geral</p>
            <p className="dashboard-member-aside-nav-resp">Geral</p>
          </a>
          <a href="#" onClick={handleGestaoConteudo} className={`dashboard-member-aside-nav-a ${gestaoConteudo ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <path d="M4 8h16"></path>
              <path d="M8 14h8"></path>
              <path d="M8 18h8"></path>
            </svg>            
            <p className='dashboard-member-aside-nav-geral'>Gestão de Conteúdo</p>
            <p className='dashboard-member-aside-nav-resp'>Conteúdo</p>
          </a>
          <a href="#" onClick={handleMinhaConta} className={`dashboard-member-aside-nav-a ${minhaConta ? "amareloActive" : "amareloDesactive"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 2-9.6 9.6"></path>
              <circle cx="7.5" cy="15.5" r="5.5"></circle>
              <path d="m15.5 7.5 2.3 2.3"></path>
              <path d="m19 4 2.1 2.1"></path>
            </svg>
            <p className='dashboard-member-aside-nav-geral'>Minha Conta</p>
            <p className='dashboard-member-aside-nav-resp'>Conta</p>
          </a>
        </nav>
        
      </aside>
      <main className="dashboard-member-main">
        {visaoGeral && <VisaoGeral />} 
        {gestaoConteudo && <GestaoConteudo handleCriarPost={handleCriarPost} handleEditarPost={handleEditarPost} />} 
        {criarPost && <CriarPost voltarParaLista={handleGestaoConteudo}/>} 
        {editarPost && <EditarPost postId={postEditandoId} voltarParaLista={handleGestaoConteudo} />}   
      </main>
    </div>
  );
}