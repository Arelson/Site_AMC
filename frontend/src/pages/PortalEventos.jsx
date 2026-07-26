import React, { useState, useEffect } from 'react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react'; // Ícones para deixar mais elegante
import './PortalNoticias.css'; // Reutilizando o mesmo CSS base do portal

export default function PortalEventos() {
  const navigate = useNavigate();

  // Estados dos dados da API
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados de Filtros, Busca e Paginação
  const [busca, setBusca] = useState('');
  const [filtroTempo, setFiltroTempo] = useState('TODOS'); // 'TODOS', 'FUTUROS', 'PASSADOS'
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  // Filtros de tempo disponíveis no cabeçalho
  const filtros = ['TODOS', 'PRÓXIMOS EVENTOS', 'EVENTOS PASSADOS'];

  useEffect(() => {
    const carregarEventos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/events');
        if (response.ok) {
          const dados = await response.json();
          // O Prisma retorna os dados mais recentes primeiro devido ao orderBy 'asc' no backend
          setEventos(dados || []);
        } else {
          setErro('Não foi possível carregar a agenda de eventos.');
        }
      } catch (error) {
        console.error('Erro ao buscar eventos do portal:', error);
        setErro('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    carregarEventos();
  }, []);

  // 1. Filtragem inteligente por Data + Barra de Pesquisa combinadas
  const eventosFiltrados = eventos.filter((evento) => {
    const hoje = new Date();
    const dataEvento = new Date(evento.date);
    
    // Filtro de Tempo (Futuro ou Passado)
    let correspondeTempo = true;
    if (filtroTempo === 'PRÓXIMOS EVENTOS') {
      correspondeTempo = dataEvento >= hoje;
    } else if (filtroTempo === 'EVENTOS PASSADOS') {
      correspondeTempo = dataEvento < hoje;
    }

    // Filtro de Busca (Texto)
    const correspondeBusca =
      evento.title.toLowerCase().includes(busca.toLowerCase()) ||
      (evento.description && evento.description.toLowerCase().includes(busca.toLowerCase())) ||
      (evento.location && evento.location.toLowerCase().includes(busca.toLowerCase()));

    return correspondeTempo && correspondeBusca;
  });

  // 2. Cálculos matemáticos da Paginação dinâmica
  const totalPaginas = Math.ceil(eventosFiltrados.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const eventosExibidos = eventosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  // Reseta para a página 1 toda vez que o usuário altera um filtro ou busca
  const lidarComMudancaFiltro = (filtro) => {
    setFiltroTempo(filtro);
    setPaginaAtual(1);
  };

  const lidarComMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  // Helper para remover tags HTML do resumo da descrição gerado pelo Tiptap
  const removerTagsHTML = (html) => {
    if (!html) return '';
    const textoLimpo = html.replace(/<[^>]*>/g, '');
    // Corta o texto se for muito longo para o card
    return textoLimpo.length > 120 ? textoLimpo.substring(0, 120) + '...' : textoLimpo;
  };

  return (
    <div className="portal-container">

      <Header
        botaoAmarelo={false}
        backgroundScroll={false} 
      />
      
      {/* Cabeçalho do Portal */}
      <header className="portal-header" style={{ backgroundColor: '#1e3a8a' }}> {/* Um tom de azul para diferenciar um pouco */}
        <div className="portal-header-conteudo">
          <h1>Agenda de Eventos</h1>
          <p>Participe dos nossos encontros, palestras, congressos e reuniões científicas.</p>
        </div>
      </header>

      {/* Controle Central Flutuante: Input + Filtros */}
      <section className="portal-barra-controle">
        <div className="busca-wrapper">
        <span className="busca-icone">🔍</span>
          <input
            type="text"
            className="busca-input"
            placeholder="Pesquisar por nome, local ou assunto..."
            value={busca}
            onChange={lidarComMudancaBusca}
            style={{ paddingLeft: '45px' }} // Ajuste para o ícone do Lucide
          />
        </div>

        <div className="filtros-grupo">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              className={`filtro-btn ${filtroTempo === filtro ? 'ativo' : ''}`}
              onClick={() => lidarComMudancaFiltro(filtro)}
            >
              {filtro}
            </button>
          ))}
        </div>
      </section>

      {/* Grid Principal de Conteúdo */}
      <main className="portal-grid">
        {loading && <div className="portal-loading">Carregando agenda de eventos...</div>}
        
        {erro && <div className="portal-erro">{erro}</div>}

        {!loading && !erro && eventosExibidos.length === 0 && (
          <div className="portal-vazio">Nenhum evento encontrado para os critérios selecionados.</div>
        )}

        {!loading && !erro && eventosExibidos.map((evento) => {
          // Formata a data e hora do evento
          const dataObjeto = new Date(evento.date);
          const dataCard = dataObjeto.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          const horaCard = dataObjeto.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Verifica se o evento já passou para estilizar a tag
          const jaPassou = dataObjeto < new Date();

          return (
            <article key={evento.id} className="noticia-card">
              <div className="card-imagem-wrapper">
                <img 
                  src={evento.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={evento.title} 
                  className="card-imagem"
                  style={{ filter: jaPassou ? 'grayscale(80%)' : 'none' }} // Deixa cinza se já passou
                />
                <span className="tag-destaque" style={{ backgroundColor: jaPassou ? '#64748b' : '#10b981' }}>
                  {jaPassou ? 'Realizado' : 'Inscrições Abertas'}
                </span>
              </div>

              <div className="card-conteudo">
                
                {/* Metadados: Data, Hora e Local */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#334155' }}>
                    <Calendar size={16} color="#2563eb" />
                    {dataCard} às {horaCard}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} />
                    {evento.location}
                  </div>
                </div>
                
                <h2 className="card-titulo">{evento.title}</h2>
                
                <p className="card-resumo">
                  {removerTagsHTML(evento.description)}
                </p>

                <button 
                  className="card-botao-ler"
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                >
                  Ver Detalhes do Evento
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

