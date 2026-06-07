import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'; // Adicionei ExternalLink
import CriarNoticia from './CriarNoticia.jsx'; 
import EditarNoticia from './EditarNoticia.jsx'; 
import './GestaoNoticias.css';

export default function GestaoNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [telaAtual, setTelaAtual] = useState('listar'); // Estados: 'listar' | 'criar' | 'editar'
  const [idSelecionado, setIdSelecionado] = useState(null);

  // Busca apenas as notícias da tabela News do usuário logado
  useEffect(() => {
    if (telaAtual === 'listar') {
      const carregarNoticiasAdmin = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3000/api/news/admin', {
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

  // Função para deletar um registro News
  const handleDeletarNews = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta notícia?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/news/${id}`, {
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

  // Renderização condicional das telas internas do Painel
  if (telaAtual === 'criar') {
    return <CriarNoticia voltarParaLista={() => setTelaAtual('listar')} />;
  }

  if (telaAtual === 'editar') {
    // AQUI: A correção do postId que conversamos antes já está aplicada
    return <EditarNoticia postId={idSelecionado} voltarParaLista={() => setTelaAtual('listar')} />;
  }

  return (
    <div className="gestao-container">
      <div className="gestao-header">
        <h2>GESTÃO DE NOTÍCIAS (AMC)</h2>
        <button className="btn-novo-registro" onClick={() => setTelaAtual('criar')}>
          <Plus size={16} /> Novo Registro
        </button>
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
          {noticias.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Nenhuma notícia registrada ainda.
              </td>
            </tr>
          ) : (
            noticias.map((item) => (
              <tr key={item.id}>
                
                {/* AQUI ESTÁ A MUDANÇA: Título Clicável */}
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
    </div>
  );
} 