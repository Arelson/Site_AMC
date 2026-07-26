import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import CriarEvento from './CriarEvento.jsx'; 
import EditarEvento from './EditarEvento.jsx'; 
import './GestaoNoticias.css'; // Reutilizando o mesmo CSS para manter a consistência visual

export default function GestaoEventos() {
  const [eventos, setEventos] = useState([]);
  const [telaAtual, setTelaAtual] = useState('listar'); // Estados: 'listar' | 'criar' | 'editar'
  const [idSelecionado, setIdSelecionado] = useState(null);

  // Busca todos os eventos cadastrados
  useEffect(() => {
    if (telaAtual === 'listar') {
      const carregarEventos = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/events');
          if (response.ok) {
            const dados = await response.json();
            setEventos(dados);
          }
        } catch (error) {
          console.error('Erro ao buscar lista de eventos:', error);
        }
      };
      carregarEventos();
    }
  }, [telaAtual]);

  // Função para deletar um evento
  const handleDeletarEvento = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente este evento?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setEventos(eventos.filter(item => item.id !== id));
      } else {
        alert('Erro ao tentar excluir o evento.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Renderização condicional das telas internas do Painel
  if (telaAtual === 'criar') {
    return <CriarEvento voltarParaLista={() => setTelaAtual('listar')} />;
  }

  if (telaAtual === 'editar') {
    return <EditarEvento eventoId={idSelecionado} voltarParaLista={() => setTelaAtual('listar')} />;
  }

  return (
    <div className="gestao-container">
      <div className="gestao-header">
        <h2>GESTÃO DE EVENTOS (AMC)</h2>
        <button className="btn-novo-registro" onClick={() => setTelaAtual('criar')}>
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      <table className="gestao-table">
        <thead>
          <tr>
            <th>TÍTULO DO EVENTO</th>
            <th>DATA DO EVENTO</th>
            <th>LOCAL</th>
            <th style={{ textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {eventos.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Nenhum evento registrado ainda.
              </td>
            </tr>
          ) : (
            eventos.map((item) => (
              <tr key={item.id}>
                
                <td 
                  className="table-titulo" 
                  onClick={() => window.open(`/evento/${item.id}`, '_blank')}
                  title="Visualizar página do evento"
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
                  {new Date(item.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                
                <td>
                  {item.location}
                </td>
                
                <td className="table-acoes">
                  <button 
                    className="btn-acao-edit" 
                    title="Editar Evento"
                    onClick={() => { 
                      setIdSelecionado(item.id); 
                      setTelaAtual('editar'); 
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    className="btn-acao-delete" 
                    title="Excluir Evento"
                    onClick={() => handleDeletarEvento(item.id)}
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
