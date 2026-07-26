import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoAMC from '../../assets/logo_amc2.png';
import './Header.css';

export default function Header({ botaoAmarelo = true,  backgroundScroll = true }) {
  //region DECLARAÇÃO DE VARIÁVEIS
  const [bgAlpha, setBgAlpha] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const nomeCompleto = localStorage.getItem('nomeCompleto');
  const primeiroNome =nomeCompleto? nomeCompleto.split(' ')[0]: '';  
  //endregion

  //region FUNÇÃO LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('nomeCompleto');
    navigate('/');
  }

  useEffect(() => {
    // SE NÃO TIVER SCROLL: Define a opacidade como 1 (fixa) e não faz mais nada
    if (!backgroundScroll) {
      return; // O "return" para a execução aqui, então ele nem cria o listener de scroll
    }

    // SE TIVER SCROLL: Cria e ativa o monitoramento da tela
    const handleScroll = () => {
      const scrollY = window.scrollY; 
      const opacity = Math.min(1, scrollY / 300); 
      setBgAlpha(opacity); 
    }

    window.addEventListener('scroll', handleScroll); 
    
    // Função de limpeza (remove o listener quando o componente sair da tela ou mudar)
    return () => window.removeEventListener('scroll', handleScroll); 
    
  }, [backgroundScroll]); // <-- O Hook fica "vigiando" essa variável

  return (
    <header 
    className="navbar" 
    style={{
        backgroundColor: isMenuOpen 
          ? 'rgb(26, 26, 64)' 
          : `rgba(26, 26, 64, ${backgroundScroll ? bgAlpha : 1})` // Se for falso, crava a opacidade no 1
    }}
    >

      {/* LOGO */}
      <div className="logo-area">
        <div className="logo-placeholder">
          <img className='logo-placeholder-img' src={logoAMC} alt="Logotipo da AMC" />
        </div>
        <div className="logo-text">
          <strong>AMC</strong>
          <span>Academia Maranhense de Ciências</span>
        </div>
      </div>

      {/* BOTÃO DO HAMBURGUER */}
      <button 
      className='hamburger-btn' 
      onClick={() => setIsMenuOpen(!isMenuOpen)} 
      aria-label='Menu'
      >
        {isMenuOpen ? 'x' : '☰'}
      </button>

      {/* LINKS DE NAVEGAÇÃO */}
      <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
        <nav className="nav-links">
          <a href="#">Inicio</a>
          <a href="#">A academia</a>
          <a href="#" onClick={() => navigate('/noticias') }>Notícia</a>
          <a href="#">Membros</a>
          <a href="#" onClick={() => navigate('/post')}>Publicações</a>
          <a href="#" onClick={() => navigate('/eventos')}>Eventos</a>
        </nav>

        {/* BOTÃO DO PORTAL DE MEMBROS */}

        {token ? (
          <div className='user-logged-area'>
            <button className='btn-portal-header amarelo' onClick={() => role === 'ADMIN'? navigate('/dashboard/admin') : navigate('/dashboard/member')}>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
                <circle cx='12' cy='7' r='4'></circle>
              </svg>
              {role === 'ADMIN' ? 'Olá, Administrador!' : `Olá, Dr(a) ${primeiroNome}`}
            </button>

            <button className='btn-logout' onClick={handleLogout} title='Sair do sistema'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                <polyline points='16 17 21 12 16 7'></polyline>
                <line x1='21' y1='12' x2='9' y2='12'></line>
              </svg>
            </button>
          </div>
        ):(
          <button onClick={() => navigate('/')} className={`btn-portal-header ${botaoAmarelo ? 'amarelo' : 'transparente'}`}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <rect width='18' height='11' x='3' y='11' rx='2' ry='2'></rect>
              <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
            </svg>
            Portal de Membros
          </button>
        )}
      </div>
    </header>
  )
}