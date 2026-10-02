import React, { useState } from 'react';
import './CriarMembro.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function FormCriarMembro({ onVoltar }) {
  const [name, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [cadeiraOcupacao, setCadeiraOcupacao] = useState('');
  const [linkLattes, setLinkLattes] = useState('');
  const [bio, setBio] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Salvando...', tipo: 'loading' });

    try {
      const response = await fetch(`${apiURL}/api/admin/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, cargo, cadeiraOcupacao, linkLattes, bio })
      });

      if (response.ok) {
        setMensagem({ texto: 'Membro cadastrado com sucesso!', tipo: 'sucesso' });
        setNome(''); setCargo(''); setCadeiraOcupacao(''); setLinkLattes(''); setBio('');
      } else {
        const erroData = await response.json();
        setMensagem({ texto: erroData.error || 'Erro ao cadastrar.', tipo: 'erro' });
      }
    } catch (error) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  return (
    <div className="form-admin-interno">
      <div className="form-admin-header">
        <h2>CADASTRAR NOVO MEMBRO</h2>
        <button className="btn-voltar" onClick={onVoltar}>← Voltar para Gestão</button>
      </div>

      {mensagem.texto && (
        <div className={`mensagem-alerta ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grupo">
          <label>Nome Completo *</label>
          <input type="text" value={name} onChange={(e) => setNome(e.target.value)} required />
        </div>

        <div className="form-grupo-duplo">
          <div className="form-grupo">
            <label>Cargo / Categoria</label>
            <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} style={{ textTransform: 'uppercase' }}/>
          </div>
          <div className="form-grupo">
            <label>Cadeira / Função</label>
            <input type="text" value={cadeiraOcupacao} onChange={(e) => setCadeiraOcupacao(e.target.value)} />
          </div>
        </div>

        <div className="form-grupo">
          <label>Link do Lattes</label>
          <input type="url" value={linkLattes} onChange={(e) => setLinkLattes(e.target.value)} />
        </div>

        <div className="form-grupo">
          <label>Biografia Curta</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="4"></textarea>
        </div>

        <button type="submit" className="admin-btn-salvar">Cadastrar Membro</button>
      </form>
    </div>
  );
}