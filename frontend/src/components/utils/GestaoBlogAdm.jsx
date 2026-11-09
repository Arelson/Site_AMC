import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react'; 
import './GestaoBlogMember.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoBlogAdmin() {
  const [todosOsPosts, setTodosOsPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  // Estados de Busca, Filtro de Status e Paginação
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // NOVO ESTADO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8; 

  useEffect(() => {
    const buscarDadosAdmin = async () => {
      try {
        const response = await fetch(`${apiURL}/api/admin/posts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTodosOsPosts(data);
        } else {
          alert('Erro ao buscar dados do administrador.');
        }
      } catch (error) {
        console.error('Erro na conexão:', error);
      } finally {
        setLoading(false);
      }
    };
    buscarDadosAdmin();
  }, []);

  // Lógica de Agrupamento
  const autoresUnicos = [];
  const mapaAutores = new Map();

  todosOsPosts.forEach((post) => {
    if (post.author && !mapaAutores.has(post.author.id)) {
      mapaAutores.set(post.author.id, true);
      autoresUnicos.push({
        ...post.author,
        totalPosts: todosOsPosts.filter(p => p.authorId === post.author.id).length
      });
    }
  });

  // Ações do Administrador
  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`${apiURL}/api/admin/posts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        setTodosOsPosts(todosOsPosts.map(post => 
          post.id === id ? { ...post, status: novoStatus } : post
        ));
      } else {
        alert('Erro ao atualizar o status.');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleExcluirPostAdmin = async (id) => {
    const confirmar = window.confirm('ATENÇÃO ADMIN: Tem certeza que deseja excluir esta postagem definitivamente?');
    if (!confirmar) return;

    try {
      const response = await fetch(`${apiURL}/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setTodosOsPosts(todosOsPosts.filter(post => post.id !== id));
      } else {
        alert('Erro ao excluir postagem');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleVoltarParaAutores = (e) => {
    e.preventDefault();
    setUsuarioSelecionado(null);
    setBusca('');
    setFiltroStatus('TODOS'); // Reseta o filtro ao voltar
    setPaginaAtual(1);
  };

  // ==========================================
  // FILTRAGEM (TELA DO USUÁRIO)
  // ==========================================
  
  const postsBrutos = usuarioSelecionado 
    ? todosOsPosts.filter(post => post.authorId === usuarioSelecionado.id)
    : [];

  const postsFiltrados = postsBrutos.filter((post) => {
    // 1. Verifica Busca de Texto (Título ou Data)
    const termo = busca.toLowerCase();
    const tituloCorresponde = post.title.toLowerCase().includes(termo);
    const dataFormatada = new Date(post.createdAt).toLocaleDateString('pt-BR').toLowerCase();
    const dataCorresponde = dataFormatada.includes(termo);
    const atendeBusca = tituloCorresponde || dataCorresponde;

    // 2. Verifica Filtro de Status
    const atendeStatus = filtroStatus === 'TODOS' || post.status === filtroStatus;
    
    // O post só aparece se atender à pesquisa de texto E ao filtro de status
    return atendeBusca && atendeStatus;
  });

  const totalPaginas = Math.ceil(postsFiltrados.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const postsExibidos = postsFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  const handleMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1); 
  };

  const handleMudancaStatus = (e) => {
    setFiltroStatus(e.target.value);
    setPaginaAtual(1); // Volta para a página 1 ao mudar de status
  };

  return (
    <div className='gestao-conteudo'>
      <DashboardHeader />
      <section className='gestao-conteudo-content'>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '24px' }}>
            Carregando sistema de moderação...
          </div>
        ) : !usuarioSelecionado ? (
          
          <>
            <div className='gestao-conteudo-content-addvlog'>
              <h2>SELECIONE UM AUTOR PARA GERENCIAR SEUS POSTS</h2>
            </div>

            <div className='gestao-conteudo-content-posts'>
              <div className='tabela-header'>
                <span>NOME DO AUTOR</span>
                <span>EMAIL</span>
                <span>TOTAL DE POSTS</span>
                <span className='acao-header'>AÇÕES</span>
              </div>
              
              {autoresUnicos.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Nenhum usuário com postagens encontrado.</div>
              ) : (
                autoresUnicos.map((autor) => (
                  <div className='tabela-linha' key={autor.id}>
                    <div className="col-info" style={{ fontWeight: 'bold' }}>
                      {autor.name.toUpperCase()}
                    </div>
                    <div className="col-data">{autor.email}</div>
                    <div className="col-status">
                      <span className="badge-publicado">
                        {autor.totalPosts} Publicações
                      </span>
                    </div>
                    <div className="col-acoes">
                      <button 
                        className="btn-ler-noticia"
                        style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}
                        onClick={() => setUsuarioSelecionado(autor)}
                      >
                        Ver Blog
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>

        ) : (

          <>
            <div className='gestao-conteudo-content-addvlog'>
              <h2>MODERANDO BLOG DE: {usuarioSelecionado.name.toUpperCase()}</h2>
              <a href="#" onClick={handleVoltarParaAutores}>
                <span style={{ fontSize: '18px' }}>← </span> Voltar para Autores
              </a>
            </div>

            {/* CONTROLES: PESQUISA E FILTRO LADO A LADO */}
            <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              
              <div style={{ 
                display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', 
                borderRadius: '8px', padding: '8px 15px', width: '100%', maxWidth: '400px', border: '1px solid #cbd5e1'
              }}>
                <Search size={18} color="#64748b" style={{ marginRight: '10px' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por título ou data..." 
                  value={busca}
                  onChange={handleMudancaBusca}
                  style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#334155' }}
                />
              </div>

              {/* SELETOR DE STATUS (DROP-DOWN) */}
              <select 
                value={filtroStatus} 
                onChange={handleMudancaStatus}
                style={{
                  padding: '9px 15px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="PUBLICADO">Publicados</option>
                <option value="REVISAO">Em Revisão</option>
                <option value="RASCUNHO">Rascunhos</option>
                <option value="BLOQUEADO">Bloqueados</option>
              </select>

            </div>

            <div className='gestao-conteudo-content-posts'>
              <div className='tabela-header'>
                <span>TÍTULO / IDENTIFICAÇÃO</span>
                <span>DATA</span>
                <span>STATUS</span>
                <span className='acao-header' style={{ flex: '1.5' }}>MODERAÇÃO</span>
              </div>
              
              {postsExibidos.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  {postsBrutos.length === 0 
                    ? "Este usuário não tem postagens." 
                    : "Nenhum post encontrado para este filtro/pesquisa."}
                </div>
              ) : (
                postsExibidos.map((post) => (
                  <div className='tabela-linha' key={post.id}>
                    <div className="col-info">
                      <Link
                        to={`/post/${post.id}`}
                        target='_blank'
                        className='post-titulo'
                        style={{ textDecoration: 'none', color: '#1e3a8a', fontWeight: '500' }}
                      >
                        {post.title}
                      </Link>
                    </div>

                    <div className="col-data">
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </div>

                    <div className="col-status">
                      <span className="badge-publicado" style={{
                        backgroundColor: 
                          post.status === 'PUBLICADO' ? '#4ade80' : 
                          post.status === 'BLOQUEADO' ? '#ef4444' : 
                          post.status === 'REVISAO' ? '#eab308' : '#94a3b8'
                      }}>
                        {post.status}
                      </span>
                    </div>

                    <div className="col-acoes" style={{ flex: '1.5', gap: '8px', display: 'flex' }}>
                      {post.status !== 'PUBLICADO' && (
                        <button className="btn-icone" title="Aprovar e Publicar" onClick={() => handleMudarStatus(post.id, 'PUBLICADO')}>✅</button>
                      )}
                      {post.status !== 'REVISAO' && (
                        <button className="btn-icone" title="Devolver para Revisão" onClick={() => handleMudarStatus(post.id, 'REVISAO')}>🔄</button>
                      )}
                      {post.status !== 'BLOQUEADO' && (
                        <button className="btn-icone" title="Bloquear Conteúdo" onClick={() => handleMudarStatus(post.id, 'BLOQUEADO')}>🚫</button>
                      )}
                      <button className="btn-icone btn-excluir" title="Excluir Definitivamente" onClick={() => handleExcluirPostAdmin(post.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e07272" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '8px' }}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroDaPagina) => (
                  <button
                    key={numeroDaPagina}
                    onClick={() => setPaginaAtual(numeroDaPagina)}
                    style={{
                      padding: '8px 12px', border: 'none', borderRadius: '5px',
                      cursor: 'pointer', fontWeight: 'bold',
                      backgroundColor: paginaAtual === numeroDaPagina ? '#0056b3' : '#e2e8f0',
                      color: paginaAtual === numeroDaPagina ? 'white' : '#475569',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {numeroDaPagina}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}