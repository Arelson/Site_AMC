import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Link } from 'react-router-dom';
import './GestaoBlogMember.css'; // Podemos reaproveitar o seu CSS atual

export default function GestaoBlogAdmin() {
  const [todosOsPosts, setTodosOsPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado que controla se estamos vendo a lista de usuários ou os posts de um específico
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  useEffect(() => {
    const buscarDadosAdmin = async () => {
      try {
        // Substitua pela rota correta que criamos no admController.js
        const response = await fetch('http://localhost:3000/api/admin/posts', {
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

  // ==========================================
  // LÓGICA DE AGRUPAMENTO (EXTRAIR USUÁRIOS)
  // ==========================================
  // Como temos uma lista de posts, vamos extrair os autores únicos para a primeira tela
  const autoresUnicos = [];
  const mapaAutores = new Map();

  todosOsPosts.forEach((post) => {
    if (post.author && !mapaAutores.has(post.author.id)) {
      mapaAutores.set(post.author.id, true);
      // Salva o autor e já conta quantos posts ele tem
      autoresUnicos.push({
        ...post.author,
        totalPosts: todosOsPosts.filter(p => p.authorId === post.author.id).length
      });
    }
  });

  // ==========================================
  // AÇÕES DO ADMINISTRADOR
  // ==========================================
  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/posts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        // Atualiza o status localmente para não precisar recarregar a página
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
      const response = await fetch(`http://localhost:3000/api/admin/posts/${id}`, {
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

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ==========================================

  // Filtra os posts apenas do usuário que o Admin clicou
  const postsDoUsuario = usuarioSelecionado 
    ? todosOsPosts.filter(post => post.authorId === usuarioSelecionado.id)
    : [];

  return (
    <div className='gestao-conteudo'>
      <DashboardHeader />
      <section className='gestao-conteudo-content'>
        

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '24px' }}>
            Carregando sistema de moderação...
          </div>
        ) : !usuarioSelecionado ? (
          
          /* ====================================================
             TELA 1: LISTA DE AUTORES (USUÁRIOS)
             ==================================================== */
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
                        className="btn-ler-noticia" // Reutilizando um estilo de botão que você já deve ter
                        style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#648bf0', color: 'white', border: 'none', borderRadius: '4px' }}
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

          /* ====================================================
             TELA 2: LISTA DE POSTS DO AUTOR SELECIONADO
             ==================================================== */
          <>
            <div className='gestao-conteudo-content-addvlog'>
              <h2>MODERANDO BLOG DE: {usuarioSelecionado.name.toUpperCase()}</h2>
              {/* Botão de voltar para a lista de usuários */}
              <a href="#" onClick={(e) => { e.preventDefault(); setUsuarioSelecionado(null); }}>
                <span style={{ fontSize: '18px' }}>← </span> Voltar para Autores
              </a>
            </div>

            <div className='gestao-conteudo-content-posts'>
              <div className='tabela-header'>
                <span>TÍTULO / IDENTIFICAÇÃO</span>
                <span>DATA</span>
                <span>STATUS</span>
                <span className='acao-header' style={{ flex: '1.5' }}>MODERAÇÃO</span>
              </div>
              
              {postsDoUsuario.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Este usuário não tem postagens.</div>
              ) : (
                postsDoUsuario.map((post) => (
                  <div className='tabela-linha' key={post.id}>
                    <div className="col-info">
                      <Link
                        to={`/post/${post.id}`}
                        target='_blank'
                        className='post-titulo'
                        style={{ textDecoration: 'none', color: 'inherit' }}
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
                      {/* Botão de Aprovar */}
                      {post.status !== 'PUBLICADO' && (
                         <button 
                         className="btn-icone" 
                         title="Aprovar e Publicar"
                         onClick={() => handleMudarStatus(post.id, 'PUBLICADO')}
                       >
                         ✅
                       </button>
                      )}
                      
                      {/* Botão de Pedir Revisão */}
                      {post.status !== 'REVISAO' && (
                         <button 
                         className="btn-icone" 
                         title="Devolver para Revisão"
                         onClick={() => handleMudarStatus(post.id, 'REVISAO')}
                       >
                         🔄
                       </button>
                      )}

                      {/* Botão de Bloquear */}
                      {post.status !== 'BLOQUEADO' && (
                         <button 
                         className="btn-icone" 
                         title="Bloquear Conteúdo"
                         onClick={() => handleMudarStatus(post.id, 'BLOQUEADO')}
                       >
                         🚫
                       </button>
                      )}

                      {/* Excluir Definitivamente */}
                      <button 
                        className="btn-icone btn-excluir" 
                        title="Excluir Definitivamente"
                        onClick={() => handleExcluirPostAdmin(post.id)}
                      >
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
          </>
        )}
      </section>
    </div>
  );
}
