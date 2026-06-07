import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Link } from 'react-router-dom';
import './GestaoBlogMember.css';

export default function GestaoBlogMember({handleCriarPost=() => {}, handleEditarPost=() => {}}) {
  const [postagens, setPostagens] = useState([]);
  const handleExcluirPost = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta postagem?');
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setPostagens(postagens.filter(post => post.id !== id));
        alert('Postagem excluida com sucesso!');
      } else {
        alert('Erro ao excluir postagem');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
      const buscarPostagens = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/posts/reader', {
            cache: 'no-store', 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
  
          if (response.ok) {
            const data = await response.json();
            setPostagens(data);
            console.log('datas encontradas:', data);
          } else {
            console.error('Erro ao buscar postagens:', response.status);
          }
        } catch (error) {
          console.error('Erro ao buscar postagens:', error);
        }
      };
      buscarPostagens();
    }, []);

  return(
    <div className='gestao-conteudo'>
          <DashboardHeader />
          <section className='gestao-conteudo-content'>
            <div className='gestao-conteudo-content-title'>
              <h1>MEU BLOG</h1>
            </div>
    
            <hr className='linha-divisoria'/>
    
            <div className='gestao-conteudo-content-addvlog'>
              <h2>GESTÃO DE POSTAGENS DE VLOG</h2>
              <a href="#" onClick={handleCriarPost}><span>+ </span>Novo Registro</a>
            </div>
    
            <div className='gestao-conteudo-content-posts'>
              <div className='tabela-header'>
                <span>TÍTULO / IDENTIFICAÇÃO</span>
                <span>DATA</span>
                <span>STATUS</span>
                <span className='acao-header'>AÇÕES</span>
              </div>
              {postagens.length === 0 ? (
                
                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '24px' }}>
                  Carregando postagens...
                </div>
    
              ) : (
                postagens.map((post) => (
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
                      
                      {/* O Prisma pode trazer os dados do autor usando "include". Mostramos o nome aqui. */}
                      <span className="post-autor">DR(A) {post.author?.name.toUpperCase() || 'AUTOR DESCONHECIDO'}</span>
                    </div>
    
                    <div className="col-data">
                      {/* Converte a data que vem do banco para o formato brasileiro */}
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </div>
    
                    <div className="col-status">
                      {/* Podemos até mudar a cor depois dependendo se está PUBLICADO ou RASCUNHO */}
                      <span className="badge-publicado">{post.status}</span>
                    </div>
    
                    <div className="col-acoes">
                      <button 
                        className="btn-icone btn-editar" 
                        title="Editar"
                        onClick={() => handleEditarPost(post.id)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#648bf0" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button 
                        className="btn-icone btn-excluir" 
                        title="Excluir"
                        onClick={() => handleExcluirPost(post.id)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#e07272" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
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
          </section>
        </div>
  )
}