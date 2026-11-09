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

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

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
        body: JSON.stringify({ name, cargo, cadeiraOcupacao, linkLattes, bio,})
      });

      if (response.ok) {
        setMensagem({ texto: 'Membro cadastrado com sucesso!', tipo: 'sucesso' });
        const formData = new FormData();
          formData.append('name', name);
          if (cargo) formData.append('cargo', cargo);
          if (cadeiraOcupacao) formData.append('cadeiraOcupacao', cadeiraOcupacao);
          if (linkLattes) formData.append('linkLattes', linkLattes);
          if (bio) formData.append('bio', bio);
          if (fotoFile) formData.append('foto', fotoFile);
        
        setTimeout(() => onVoltar(), 1000);
      } else {
        const erroData = await response.json();
        setMensagem({ texto: erroData.error || 'Erro ao cadastrar.', tipo: 'erro' });
      }
    } catch (error) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' }, error);
    }
  };

  const handleUploadFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file)); // Mostra o preview na hora
    }
  };

  return (
    <div className="form-admin-interno">
      <div className="form-admin-header">
        <h2>CRIAR MEMBRO</h2>
        <button type="button" className="btn-voltar" onClick={onVoltar}>← Voltar para Gestão</button>
      </div>

      {mensagem.texto && (
        <div className={`mensagem-alerta ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        
        {/* ÁREA DA FOTO DE PERFIL (Para o Admin Alterar) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div 
            style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              backgroundColor: '#eaeaea', overflow: 'hidden', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '2px solid #ccc', marginBottom: '10px'
            }}
          >
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '30px', color: '#888' }}>
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </span>
            )}
          </div>
          <label style={{ cursor: 'pointer', color: '#0056b3', fontSize: '13px', fontWeight: 'bold' }}>
            📎 Alterar Foto do Membro
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUploadFoto} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        {/* CAMPOS DE TEXTO */}
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

        <button type="submit" className="admin-btn-salvar">Salvar Alterações</button>
      </form>
    </div>
  );
}