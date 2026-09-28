import React, { useState, useEffect } from 'react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import './MembroPage.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PortalEquipe() {
  const navigate = useNavigate();

  // Estados dos dados da API
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados de Filtros, Busca e Paginação
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('TODOS');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8; // Podemos colocar mais itens por página já que cards de perfil são menores

  useEffect(() => {
    const carregarMembros = async () => {
      try {
        // Usa a rota pública que criamos na etapa anterior
        const response = await fetch(`${apiURL}/api/auth/members`);
        if (response.ok) {
          const dados = await response.json();
          setMembros(dados);
        } else {
          setErro('Não foi possível carregar a lista de membros.');
        }
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
        setErro('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    carregarMembros();
  }, []);

  // Cria as categorias automaticamente baseadas nos cargos cadastrados no banco
  const cargosUnicos = ['TODOS', ...new Set(membros.map(m => m.cargo ? m.cargo.toUpperCase() : 'MEMBROS'))];

  // 1. Filtragem inteligente por Cargo + Barra de Pesquisa combinadas
  const membrosFiltrados = membros.filter((membro) => {
    const cargoDoMembro = membro.cargo ? membro.cargo.toUpperCase() : 'MEMBROS';
    
    // Verifica se o filtro ativo bate com o cargo (ou se está em 'TODOS')
    const correspondeCategoria = filtroAtivo === 'TODOS' || cargoDoMembro === filtroAtivo;

    // Busca por texto no Nome, Cargo ou Cadeira
    const termoBusca = busca.toLowerCase();
    const correspondeBusca =
      membro.name.toLowerCase().includes(termoBusca) ||
      (membro.cargo && membro.cargo.toLowerCase().includes(termoBusca)) ||
      (membro.cadeiraOcupacao && membro.cadeiraOcupacao.toLowerCase().includes(termoBusca));

    return correspondeCategoria && correspondeBusca;
  });

  // 2. Cálculos matemáticos da Paginação dinâmica
  const totalPaginas = Math.ceil(membrosFiltrados.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const membrosExibidos = membrosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  // Reseta para a página 1 toda vez que o usuário altera um filtro ou busca
  const lidarComMudancaFiltro = (categoria) => {
    setFiltroAtivo(categoria);
    setPaginaAtual(1);
  };

  const lidarComMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  return (
    <div className="equipe-portal-container">
      <Header botaoAmarelo={false} backgroundScroll={false} />
      
      {/* Cabeçalho do Portal */}
      <div className="equipe-portal-container">
        <header className="equipe-header-hero">
          <div className="equipe-header-conteudo">
            <h1>Nossa Equipe</h1>
            <p>Conheça os pesquisadores, diretores e membros que fazem parte do nosso laboratório.</p>
          </div>
        </header>

        {/* Controle Central Flutuante: Input + Filtros */}
        <section className="equipe-barra-controle">
          <div className="equipe-busca-wrapper">
            <span className="equipe-busca-icone">🔍</span>
            <input
              type="text"
              className="equipe-busca-input"
              placeholder="Pesquisar por nome, cargo ou cadeira..."
              value={busca}
              onChange={lidarComMudancaBusca}
            />
          </div>

          <div className="equipe-filtros-grupo">
            {cargosUnicos.map((cat) => (
              <button
                key={cat}
                className={`equipe-filtro-btn ${filtroAtivo === cat ? 'ativo' : ''}`}
                onClick={() => lidarComMudancaFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Grid Principal de Conteúdo */}
        <main className="equipe-grid">
          {loading && <div className="equipe-loading">Carregando membros...</div>}
          
          {erro && <div className="equipe-erro">{erro}</div>}

          {!loading && !erro && membrosExibidos.length === 0 && (
            <div className="equipe-vazio">Nenhum membro encontrado para esta pesquisa.</div>
          )}

          {!loading && !erro && membrosExibidos.map((membro) => (
            <article key={membro.id} className="equipe-card">
              
              <div className="equipe-card-foto">
                {/* Se o membro não tiver foto cadastrada, mostra a primeira letra do nome */}
                {membro.fotoPerfil && membro.fotoPerfil !== 'default.png' ? (
                  <img src={`/uploads/${membro.fotoPerfil}`} alt={`Foto de ${membro.name}`} />
                ) : (
                  <div className="equipe-foto-placeholder">
                    {membro.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="equipe-card-conteudo">
                <h2 className="equipe-card-nome">{membro.name}</h2>
                <p className="equipe-card-cargo">{membro.cargo || 'Membro'}</p>
                
                {membro.cadeiraOcupacao && (
                  <span className="equipe-card-cadeira">{membro.cadeiraOcupacao}</span>
                )}

                {/* Botões de Ação */}
                <div className="equipe-card-acoes">
                  {membro.linkLattes && (
                    <a href={membro.linkLattes} target="_blank" rel="noopener noreferrer" className="equipe-btn-lattes">
                      Lattes
                    </a>
                  )}
                  {/* Futuramente você pode criar uma página dedicada para exibir o perfil completo */}
                  <button 
                    className="equipe-btn-perfil"
                    onClick={() => navigate(`/membro/${membro.id}`)}
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </main>

        {/* Paginação Estilizada */}
        {!loading && !erro && totalPaginas > 1 && (
          <nav className="equipe-paginacao">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
              <button
                key={numeroPagina}
                className={`equipe-paginacao-btn ${paginaAtual === numeroPagina ? 'ativo' : ''}`}
                onClick={() => setPaginaAtual(numeroPagina)}
              >
                {numeroPagina}
              </button>
            ))}
          </nav>
        )}
      </div>
      <Footer />
    </div>
  );
}