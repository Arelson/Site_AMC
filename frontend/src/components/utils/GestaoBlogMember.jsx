import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react'; // Ícone da lupa
import './GestaoBlogMember.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoBlogMember({ handleCriarPost = () => {}, handleEditarPost = () => {} }) {
  const [postagens, setPostagens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Busca e Paginação
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8; // Quantidade de posts exibidos por página

  const handleExcluirPost = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta postagem?');
    if (!confirmar) return;

    try {
      const response = await fetch(`${apiURL}/api/posts/${id}`, {
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
        const response = await fetch(`${apiURL}/api/posts/reader`, {
          cache: 'no-store', 
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          setPostagens(data);
        } else {
          console.error('Erro ao buscar postagens:', response.status);
        }
      } catch (error) {
        console.error('Erro ao buscar postagens:', error);
      } finally {
        setLoading(false);
      }
    };
    buscarPostagens();
  }, []);

  // ==========================================
  // FILTRAGEM E PAGINAÇÃO
  // ==========================================
  const postagensFiltradas = postagens.filter((post) => {
    const termo = busca.toLowerCase();
    const tituloCorresponde = post.title.toLowerCase().includes(termo);
    const dataFormatada = new Date(post.createdAt).toLocaleDateString('pt-BR').toLowerCase();
    const dataCorresponde = dataFormatada.includes(termo);
    
    return tituloCorresponde || dataCorresponde;
  });

  const totalPaginas = Math.ceil(postagensFiltradas.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const postagensExibidas = postagensFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  const handleMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1); // Retorna para a primeira página ao buscar
  };

  return (
    <div className='gestao-conteudo'>
      <section className='gestao-conteudo-content'>

        <div className='gestao-conteudo-content-addvlog'>
          <h2>GESTÃO DE POSTAGENS DE BLOG</h2>
          <a href="#" onClick={(e) => { e.preventDefault(); handleCriarPost(); }}>
            <span>+ </span>Novo Registro
          </a>
        </div>

        {/* BARRA DE PESQUISA */}
        <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '8px', 
            padding: '8px 15px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #cbd5e1'
          }}>
            <Search size={18} color="#64748b" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Buscar por título ou data..." 
              value={busca}
              onChange={handleMudancaBusca}
              style={{ 
                border: 'none', backgroundColor: 'transparent', 
                outline: 'none', width: '100%',
                fontSize: '14px', color: '#334155'
              }}
            />
          </div>
        </div>

        <div className='gestao-conteudo-content-posts'>
          <div className='tabela-header'>
            <span>TÍTULO / IDENTIFICAÇÃO</span>
            <span>DATA</span>
            <span>STATUS</span>
            <span className='acao-header'>AÇÕES</span>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '18px' }}>
              Carregando postagens...
            </div>
          ) : postagensExibidas.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              {postagens.length === 0 
                ? "Você ainda não criou nenhuma postagem." 
                : "Nenhuma postagem encontrada na pesquisa."}
            </div>
          ) : (
            postagensExibidas.map((post) => (
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
                  <span className="post-autor">
                    DR(A) {post.author?.name.toUpperCase() || 'AUTOR DESCONHECIDO'}
                  </span>
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

                <div className="col-acoes">
                  <button 
                    className="btn-icone btn-editar" 
                    title="Editar"
                    onClick={() => handleEditarPost(post.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#648bf0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                  <button 
                    className="btn-icone btn-excluir" 
                    title="Excluir"
                    onClick={() => handleExcluirPost(post.id)}
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

        {/* CONTROLES DE PAGINAÇÃO */}
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
      </section>
    </div>
  );
}