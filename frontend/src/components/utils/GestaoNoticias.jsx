import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'; // Adicionei o ícone Search
import CriarNoticia from './CriarNoticia.jsx'; 
import EditarNoticia from './EditarNoticia.jsx'; 
import './GestaoNoticias.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [telaAtual, setTelaAtual] = useState('listar'); 
  const [idSelecionado, setIdSelecionado] = useState(null);

  // Novos estados para Busca e Paginação
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; // Você pode alterar para 5, 8, 15...

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

  const handleDeletarNews = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta notícia?')) return;
    
    try {
      const token = localStorage.getItem('token');
      // Correção para usar a variável apiURL para manter o padrão
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

  // 1. Lógica de Filtragem (Pesquisa)
  const noticiasFiltradas = noticias.filter((noticia) => {
    const termo = busca.toLowerCase();
    const tituloCorresponde = noticia.title.toLowerCase().includes(termo);
    
    // Formata a data igual aparece na tabela para a busca funcionar com a data visível
    const dataFormatada = new Date(noticia.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toLowerCase();
    
    const dataCorresponde = dataFormatada.includes(termo);

    return tituloCorresponde || dataCorresponde;
  });

  // 2. Lógica de Paginação (Fatiamento)
  const totalPaginas = Math.ceil(noticiasFiltradas.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const noticiasExibidas = noticiasFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  // Sempre que digitar algo na busca, volta para a página 1
  const handleMudancaBusca = (e) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  // Renderização condicional das telas internas
  if (telaAtual === 'criar') {
    return <CriarNoticia voltarParaLista={() => setTelaAtual('listar')} />;
  }

  if (telaAtual === 'editar') {
    return <EditarNoticia postId={idSelecionado} voltarParaLista={() => setTelaAtual('listar')} />;
  }

  return (
    <div className="gestao-container">
      <div className="gestao-header" style={{ marginBottom: '15px' }}>
        <h2>GESTÃO DE NOTÍCIAS (AMC)</h2>
        <button className="btn-novo-registro" onClick={() => setTelaAtual('criar')}>
          <Plus size={16} /> Novo Registro
        </button>
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
            placeholder="Buscar por título ou data (ex: 15 de out)..." 
            value={busca}
            onChange={handleMudancaBusca}
            style={{ 
              border: 'none', 
              backgroundColor: 'transparent', 
              outline: 'none', 
              width: '100%',
              fontSize: '14px',
              color: '#334155'
            }}
          />
        </div>
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
                  : "Nenhuma notícia encontrada para esta busca."}
              </td>
            </tr>
          ) : (
            noticiasExibidas.map((item) => (
              <tr key={item.id}>
                
                <td 
                  className="table-titulo" 
                  onClick={() => window.open(`/noticia/${item.id}`, '_blank')}
                  title="Visualizar página da notícia"
                  style={{ 
                    cursor: 'pointer', 
                    color: '#1e3a8a', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  {item.title}
                  <ExternalLink size={14} color="#64748b" />
                </td>

                <td>
                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td>
                  <span className={`badge-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td className="table-acoes">
                  <button 
                    className="btn-acao-edit" 
                    title="Editar Notícia"
                    onClick={() => { 
                      setIdSelecionado(item.id); 
                      setTelaAtual('editar'); 
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    className="btn-acao-delete" 
                    title="Excluir Notícia"
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
                padding: '8px 12px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
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