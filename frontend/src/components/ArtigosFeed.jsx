import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileText } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import './Blog.css'; // Reutilizamos o CSS do Blog para manter o padrão visual!

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ArtigosFeed() {
  const [artigos, setArtigos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);

  // Estados de Busca
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');

  useEffect(() => {
    const fetchFeedArtigos = async () => {
      setLoading(true);
      try {
        // 👇 IMPORTANTE: Certifique-se de que essa rota existe no seu backend!
        const response = await fetch(`${apiURL}/api/article/reader?page=${paginaAtual}&search=${buscaAplicada}`);
        
        if (response.ok) {
          const data = await response.json();
          // Aqui eu assumo que o backend devolve { articles: [...], totalPaginas: X }
          setArtigos(data.articles || data.artigos || []);
          setTotalPaginas(data.totalPaginas || 1);
        }
      } catch (error) {
        console.error("Erro ao buscar feed de artigos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedArtigos();
  }, [paginaAtual, buscaAplicada]);

  // Artigos não usam HTML no resumo, então é só cortar o texto normalmente
  const limitarResumo = (texto, maxLength = 120) => {
    if (!texto) return 'Sem resumo disponível.';
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const lidarComTeclaBusca = (e) => {
    if (e.key === 'Enter') {
      setBuscaAplicada(busca);
      setPaginaAtual(1);
    }
  };

  if (loading) {
    return <div className='loading-blog'>Carregando biblioteca de artigos...</div>;
  }

  return (
    <div className='feed-blog-container'>
      <div className='feed-blog-header'>
        <h2>Portal de Artigos Científicos</h2>
        <div className='linha-decorativa'></div>
      </div>

      <section className="portal-barra-controle">
        <div className="busca-wrapper">
          <span className="busca-icone">🔍</span>
          <input
            type="text"
            className="busca-input"
            placeholder="Pesquisar artigos por título, autor ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={lidarComTeclaBusca}
          />
        </div>
      </section>

      {/* Reutilizamos o grid e cards do Blog */}
      <div className='feed-blog-grid'>
        {artigos.map((artigo) => (
          <div key={artigo.id} className='blog-card'>
            <div className='blog-card-banner'>
              {/* Usa a capa gerada ou o fallback padrão */}
              <img
                src={artigo.coverImage ? `${apiURL}${artigo.coverImage}` : 'https://placehold.co/400x220/e2e8f0/1a1a40?text=ARTIGO+CIENT%C3%8DFICO'} 
                alt={artigo.title}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/400x220/e2e8f0/1a1a40?text=ARTIGO+CIENT%C3%8DFICO';
                }}
              />
            </div>
            
            <div className='blog-card-body'>
              <div className='blog-author-area'>
                <div className='blog-avatar-fake'>
                  {artigo.author?.name ? artigo.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className='blog-author-info'>
                  <span className='lbl-publicado'>PESQUISADOR</span>
                  <span className='blog-author-name'>Dr(a). {artigo.author?.name || 'Autor Desconhecido'}</span>
                </div>
              </div>

              <div className='blog-date' style={{ display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} />
                  <span>{formatarData(artigo.createdAt)}</span>
                </div>
                {/* Ícone extra para mostrar que é um PDF */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0056b3' }}>
                  <FileText size={14} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>PDF</span>
                </div>
              </div>

              <h3 className='blog-card-title' style={{ fontSize: '1.1rem' }}>{artigo.title}</h3>

              <p className='blog-card-excerpt'>
                {limitarResumo(artigo.abstract)}
              </p>
              
              {/* Link direcionando para a rota de Leitor de Artigo */}
              <Link
                to={`/artigo/${artigo.id}`}
                className='btn-ver-postagem'
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                ACESSAR DOCUMENTO
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação Idêntica à do Blog */}
      {totalPaginas > 1 && (
        <div className='blog-pagination'>
          <button
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className='pagination-arrow'
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPaginas }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setPaginaAtual(index + 1)}
              className={`pagination-number ${paginaAtual === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className='pagination-arrow'
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
