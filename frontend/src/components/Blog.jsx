import React, { useEffect, useState } from 'react';
import { Calendar, Play, ChevronLeft, ChevronRight } from 'lucide-react';  // Importe os ícones
import { Link } from 'react-router-dom';
import './Blog.css';



export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/posts/feed?page=${paginaAtual}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
          setTotalPaginas(data.totalPaginas);
        }
      } catch (error) {
        console.error("Erro ao buscar feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [paginaAtual]);

  const removerHtmlParaResumo = (html, maxLength = 100) => {
    if (!html) return '';   // Se o HTML estiver vazio, retorne uma string vazia
    const textoPuro = html.replace(/<[^>]*>/g, ''); // Remove todas as tags HTML
    return textoPuro.length > maxLength ? textoPuro.substring(0, maxLength) + '...' : textoPuro;
  }; //Serve para remover as tags HTML e limitar o texto a um resumo de 100 caracteres, eu preciso disso para mostrar um resumo do post no feed, sem exibir o conteúdo completo ou as tags HTML.

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className='loading-blog'>Carregando feed...</div>;
  }
  return (
    <div className ='feed-blog-container'>
      <div className='feed-blog-header'>
        <h2>Feed do Blog</h2>
        <div className='linha-decorativa'></div>
      </div>
      <div className='feed-blog-grid'>
        {posts.map((post) => (
          <div key={post.id} className='blog-card'>
            <div className='blog-card-banner'>
              <img
                src={post.banner || 'https://placehold.co/400x220/e2e8f0/1a1a40?text=AMC'} // Exibe uma imagem padrão se o banner estiver vazio
                alt={post.title}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/400x220/e2e8f0/1a1a40?text=AMC';
                }}
              />
            </div>
            
            <div className='blog-card-body'>
              <div className='blog-author-area'>
                <div className='blog-avatar-fake'>
                  {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className='blog-author-info'>
                  <span className='lbl-publicado'>PUBLICADO POR</span>
                  <span className='blog-author-name'>{post.author?.name || 'Autor Desconhecido'}</span>
                </div>
              </div>

              <div className='blog-date'>
                <Calendar size={14} />
                <span>{formatarData(post.createdAt)}</span>
              </div>

              <h3 className='blog-card-title'>{post.title}</h3>

              <p className='blog-card-excerpt'>
                {removerHtmlParaResumo(post.content)}
              </p>
              <Link
                to={`/post/${post.id}`}
                target='_blank'
                className='btn-ver-postagem'
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                VER POSTAGEM COMPLETA
              </Link>
            </div>
          </div>
        ))}
      </div>

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