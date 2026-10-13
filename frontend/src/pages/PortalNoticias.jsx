import React, { useState, useEffect } from 'react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import './PortalNoticias.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PortalNoticias() {
  const navigate = useNavigate();

  // Estados dos dados da API
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados de Filtros e Busca
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState(''); // Guarda o termo só quando aperta Enter
  const [filtroAtivo, setFiltroAtivo] = useState('TODAS');
  
  // Paginação controlada pela API
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1); // Vem do backend agora!

  const categorias = ['TODAS', 'CIÊNCIA', 'EVENTOS', 'ACADEMIA', 'PARCERIAS', 'EDITAIS'];

  // Refatorado: O useEffect agora "escuta" a Página, o Filtro e a Busca
  useEffect(() => {
    const carregarNoticias = async () => {
      setLoading(true);
      try {
        // Constrói a URL passando as variáveis para o backend do Postgres trabalhar
        const url = `${apiURL}/api/news/feed?page=${paginaAtual}&search=${buscaAplicada}&category=${filtroAtivo}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const dados = await response.json();
          setNoticias(dados.posts || []);
          setTotalPaginas(dados.totalPaginas || 1); // Salva o total de páginas que o banco calculou
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
  }, [paginaAtual, filtroAtivo, buscaAplicada]); // Recarrega se qualquer um desses 3 mudar

  // Handlers
  const lidarComMudancaFiltro = (categoria) => {
    setFiltroAtivo(categoria);
    setPaginaAtual(1); // Volta pra página 1 ao trocar de categoria
  };

  // Dispara a busca no banco apenas quando o usuário apertar Enter (evita travar o servidor a cada letra digitada)
  const lidarComTeclaBusca = (e) => {
    if (e.key === 'Enter') {
      setBuscaAplicada(busca);
      setPaginaAtual(1);
    }
  };

  const removerTagsHTML = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="portal-container">
      <Header botaoAmarelo={false} backgroundScroll={false} />
      
      <header className="portal-header">
        <div className="portal-header-conteudo">
          <h1>Portal de Notícias</h1>
          <p>Mantenha-se atualizado com as últimas descobertas e avanços científicos da nossa região.</p>
        </div>
      </header>

      <section className="portal-barra-controle">
        <div className="busca-wrapper">
          <span className="busca-icone">🔍</span>
          <input
            type="text"
            className="busca-input"
            placeholder="Pesquisar e apertar Enter..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={lidarComTeclaBusca} /* Aciona a busca no backend ao apertar Enter */
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

      <main className="portal-grid">
        {loading && <div className="portal-loading">Carregando portal de notícias...</div>}
        {erro && <div className="portal-erro">{erro}</div>}

        {/* Como o backend já filtrou, usamos a lista 'noticias' diretamente */}
        {!loading && !erro && noticias.length === 0 && (
          <div className="portal-vazio">Nenhuma notícia encontrada para os critérios selecionados.</div>
        )}

        {!loading && !erro && noticias.map((noticia) => {
          const dataCard = new Date(noticia.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric',
          });

          return (
            <article key={noticia.id} className="noticia-card">
              <div className="card-imagem-wrapper">
                <img 
                  src={noticia.banner || 'https://via.placeholder.com/400x220'} 
                  alt={noticia.title} 
                  className="card-imagem"
                />
                <span className="tag-destaque">Destaque</span>
              </div>

              <div className="card-conteudo">
                <div className="card-data">📅 {dataCard}</div>
                <h2 className="card-titulo">{noticia.title}</h2>
                <p className="card-resumo">{removerTagsHTML(noticia.content)}</p>
                <button 
                  className="card-botao-ler"
                  onClick={() => navigate(`/noticia/${noticia.id}`)}
                >
                  Ler Notícia Completa
                </button>
              </div>
            </article>
          );
        })}
      </main>

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