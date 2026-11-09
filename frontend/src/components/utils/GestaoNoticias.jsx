import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'; 
import CriarNoticia from './CriarNoticia.jsx'; 
import EditarNoticia from './EditarNoticia.jsx'; 
import './GestaoNoticias.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [telaAtual, setTelaAtual] = useState('listar'); 
  const [idSelecionado, setIdSelecionado] = useState(null);

  // Estados para Busca, Filtro e Paginação
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // NOVO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    if (telaAtual === 'listar') {
      const carregarNoticiasAdmin = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${apiURL}/api/news/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const dados = await response.json();
            setNoticias(dados);
          }
        } catch (error) {
          console.error('Erro ao buscar lista de gerenciamento de notícias:', error);
        }
      };
      carregarNoticiasAdmin();
    }
  }, [telaAtual]);

  // Função para mudar o status de uma notícia diretamente
  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Ajuste esta rota para bater com a rota PATCH de status de notícias do seu backend
      const response = await fetch(`${apiURL}/api/news/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        setNoticias(noticias.map(noticia => 
          noticia.id === id ? { ...noticia, status: novoStatus } : noticia
        ));
      } else {
        alert('Erro ao atualizar o status da notícia.');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Função que muda para o status RASCUNHO antes de abrir a tela de edição
  const handleEditar = async (id) => {
    // 1. Muda o status no banco para RASCUNHO
    await handleMudarStatus(id, 'RASCUNHO');
    
    // 2. Abre a tela de edição
    setIdSelecionado(id); 
    setTelaAtual('editar');
  };

  const handleDeletarNews = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta notícia?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiURL}/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNoticias(noticias.filter(item => item.id !== id));
      } else {
        alert('Erro ao tentar excluir a notícia.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // FILTRAGEM (Pesquisa + Status)
  // ==========================================
  const noticiasFiltradas = noticias.filter((noticia) => {
    // Busca por Texto
    const termo = busca.toLowerCase();
    const tituloCorresponde = noticia.title.toLowerCase().includes(termo);
    const dataFormatada = new Date(noticia.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).toLowerCase();
    const dataCorresponde = dataFormatada.includes(termo);
    const atendeBusca = tituloCorresponde || dataCorresponde;

    // Filtro por Status
    const atendeStatus = filtroStatus === 'TODOS' || noticia.status === filtroStatus;

    return atendeBusca && atendeStatus;
  });

  // ==========================================
  // PAGINAÇÃO
  // ==========================================
  const totalPaginas = Math.ceil(noticiasFiltradas.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const noticiasExibidas = noticiasFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  const handleMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  const handleMudancaStatus = (e) => {
    setFiltroStatus(e.target.value);
    setPaginaAtual(1); 
  };

  // Renderização condicional das telas internas
  if (telaAtual === 'criar') return <CriarNoticia voltarParaLista={() => setTelaAtual('listar')} />;
  if (telaAtual === 'editar') return <EditarNoticia postId={idSelecionado} voltarParaLista={() => setTelaAtual('listar')} />;

  return (
    <div className="gestao-container">
      <div className="gestao-header" style={{ marginBottom: '15px' }}>
        <h2>GESTÃO DE NOTÍCIAS (AMC)</h2>
        <button className="btn-novo-registro" onClick={() => setTelaAtual('criar')}>
          <Plus size={16} /> Novo Registro
        </button>
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
            placeholder="Buscar por título ou data (ex: 15 de out)..." 
            value={busca}
            onChange={handleMudancaBusca}
            style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#334155' }}
          />
        </div>

        {/* SELETOR DE STATUS */}
        <select 
          value={filtroStatus} 
          onChange={handleMudancaStatus}
          style={{
            padding: '9px 15px', borderRadius: '8px', border: '1px solid #cbd5e1',
            backgroundColor: '#f1f5f9', color: '#334155', fontSize: '14px',
            outline: 'none', cursor: 'pointer', fontWeight: '500'
          }}
        >
          <option value="TODOS">Todos os Status</option>
          <option value="PUBLICADO">Publicados</option>
          <option value="RASCUNHO">Rascunhos</option>
          <option value="OCULTO">Ocultos / Arquivados</option>
        </select>
      </div>

      <table className="gestao-table">
        <thead>
          <tr>
            <th>TÍTULO / IDENTIFICAÇÃO</th>
            <th>DATA DE CRIAÇÃO</th>
            <th>STATUS</th>
            <th style={{ textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {noticiasExibidas.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                {noticias.length === 0 
                  ? "Nenhuma notícia registrada ainda." 
                  : "Nenhuma notícia encontrada para este filtro/pesquisa."}
              </td>
            </tr>
          ) : (
            noticiasExibidas.map((item) => (
              <tr key={item.id}>
                
                <td 
                  className="table-titulo" 
                  onClick={() => window.open(`/noticia/${item.id}`, '_blank')}
                  title="Visualizar página da notícia"
                  style={{ cursor: 'pointer', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {item.title}
                  <ExternalLink size={14} color="#64748b" />
                </td>

                <td>
                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td>
                  <span className={`badge-status ${item.status ? item.status.toLowerCase() : 'rascunho'}`}>
                    {item.status || 'RASCUNHO'}
                  </span>
                </td>
                
                {/* COLUNA DE AÇÕES COM OS NOVOS BOTÕES */}
                <td className="table-acoes" style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  
                  {/* Botões Rápidos de Status (Moderação) */}
                  {item.status !== 'PUBLICADO' && (
                    <button className="btn-acao-edit" title="Aprovar e Publicar" onClick={() => handleMudarStatus(item.id, 'PUBLICADO')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>✅</button>
                  )}
                  {item.status !== 'RASCUNHO' && (
                    <button className="btn-acao-edit" title="Voltar para Rascunho" onClick={() => handleMudarStatus(item.id, 'RASCUNHO')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>🔄</button>
                  )}
                  {item.status !== 'OCULTO' && (
                    <button className="btn-acao-edit" title="Ocultar Notícia" onClick={() => handleMudarStatus(item.id, 'OCULTO')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>🚫</button>
                  )}

                  {/* Divisória visual entre Status e Edição */}
                  <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>

                  {/* Editar e Excluir */}
                  <button 
                    className="btn-acao-edit" 
                    title="Editar Notícia (Muda para Rascunho automaticamente)"
                    onClick={() => handleEditar(item.id)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    className="btn-acao-delete" 
                    title="Excluir Definitivamente"
                    onClick={() => handleDeletarNews(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINAÇÃO */}
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
    </div>
  );
}