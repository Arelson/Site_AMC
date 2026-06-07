import React, { useState, useEffect } from 'react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import './PortalNoticias.css';

export default function PortalNoticias() {
  const navigate = useNavigate();

  // Estados dos dados da API
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados de Filtros, Busca e Paginação
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('TODAS');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6; // Quantidade de cards por página

  // Categorias disponíveis no cabeçalho (idêntico ao print)
  const categorias = ['TODAS', 'CIÊNCIA', 'EVENTOS', 'ACADEMIA', 'PARCERIAS'];

  useEffect(() => {
    const carregarNoticias = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/news/feed');
        if (response.ok) {
          const dados = await response.json();
          setNoticias(dados.posts || []); // Ajuste para acessar a propriedade correta do JSON
        } else {
          setErro('Não foi possível carregar o feed de notícias.');
        }
      } catch (error) {
        console.error('Erro ao buscar notícias do portal:', error);
        setErro('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    carregarNoticias();
  }, []);

  // 1. Filtragem inteligente por Categoria + Barra de Pesquisa combinadas
  const noticiasFiltradas = noticias.filter((noticia) => {
    const correspondeCategoria =
      filtroAtivo === 'TODAS' ||
      (noticia.category && noticia.category.toUpperCase() === filtroAtivo.toUpperCase());

    const correspondeBusca =
      noticia.title.toLowerCase().includes(busca.toLowerCase()) ||
      (noticia.content && noticia.content.toLowerCase().includes(busca.toLowerCase()));

    return correspondeCategoria && correspondeBusca;
  });

  // 2. Cálculos matemáticos da Paginação dinâmica
  const totalPaginas = Math.ceil(noticiasFiltradas.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const noticiasExibidas = noticiasFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  // Reseta para a página 1 toda vez que o usuário altera um filtro ou busca
  const lidarComMudancaFiltro = (categoria) => {
    setFiltroAtivo(categoria);
    setPaginaAtual(1);
  };

  const lidarComMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  // Helper para remover tags HTML do resumo/snippet do texto gerado pelo Tiptap
  const removerTagsHTML = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="portal-container">

      <Header
        botaoAmarelo={false}
        backgroundScroll={false} 
      />
      {/* Cabeçalho do Portal */}
      <header className="portal-header">
        <div className="portal-header-conteudo">
          <h1>Portal de Notícias</h1>
          <p>Mantenha-se atualizado com as últimas descobertas e avanços científicos da nossa região.</p>
        </div>
      </header>

      {/* Controle Central Flutuante: Input + Filtros */}
      <section className="portal-barra-controle">
        <div className="busca-wrapper">
          <span className="busca-icone">🔍</span>
          <input
            type="text"
            className="busca-input"
            placeholder="Pesquisar notícias..."
            value={busca}
            onChange={lidarComMudancaBusca}
          />
        </div>

        <div className="filtros-grupo">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`filtro-btn ${filtroAtivo === cat ? 'ativo' : ''}`}
              onClick={() => lidarComMudancaFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid Principal de Conteúdo */}
      <main className="portal-grid">
        {loading && <div className="portal-loading">Carregando portal de notícias...</div>}
        
        {erro && <div className="portal-erro">{erro}</div>}

        {!loading && !erro && noticiasExibidas.length === 0 && (
          <div className="portal-vazio">Nenhuma notícia encontrada para os critérios selecionados.</div>
        )}

        {!loading && !erro && noticiasExibidas.map((noticia) => {
          // Formata a data de criação (Ex: 12 Mar 2026)
          const dataCard = new Date(noticia.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <article key={noticia.id || noticia._id} className="noticia-card">
              <div className="card-imagem-wrapper">
                <img 
                  src={noticia.banner || 'https://via.placeholder.com/400x220'} 
                  alt={noticia.title} 
                  className="card-imagem"
                />
                <span className="tag-destaque">Destaque</span>
              </div>

              <div className="card-conteudo">
                <div className="card-data">
                  📅 {dataCard}
                </div>
                
                <h2 className="card-titulo">{noticia.title}</h2>
                
                <p className="card-resumo">
                  {removerTagsHTML(noticia.content)}
                </p>

                <button 
                  className="card-botao-ler"
                  onClick={() => navigate(`/noticia/${noticia.id || noticia._id}`)}
                >
                  Ler Notícia Completa
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* Paginação Estilizada */}
      {!loading && !erro && totalPaginas > 1 && (
        <nav className="portal-paginacao">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
            <button
              key={numeroPagina}
              className={`paginacao-btn ${paginaAtual === numeroPagina ? 'ativo' : ''}`}
              onClick={() => setPaginaAtual(numeroPagina)}
            >
              {numeroPagina}
            </button>
          ))}
        </nav>
      )}

    </div>
  );
}