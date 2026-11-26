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
  const [email, setEmail] = useState('');
  const [patrono, setPatrono] = useState('');

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Salvando...', tipo: 'loading' });

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (cargo) formData.append('cargo', cargo);
      if (cadeiraOcupacao) formData.append('cadeiraOcupacao', cadeiraOcupacao ? `Cadeira n° ${cadeiraOcupacao.padStart(2, '0')}` : null);
      if (linkLattes) formData.append('linkLattes', linkLattes);
      if (bio) formData.append('bio', bio);
      if (fotoFile) formData.append('foto', fotoFile);
      if (email) formData.append('email', email);
      if (patrono) formData.append('patrono', patrono);

      const response = await fetch(`${apiURL}/api/admin/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, cargo, cadeiraOcupacao, linkLattes, bio, email, patrono})
      });

      if (response.ok) {
        setMensagem({ texto: 'Membro cadastrado com sucesso!', tipo: 'sucesso' });
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

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="input-form"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@amc-ma.org"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="patrono">Nome do Patrono</label>
          <input
            id="patrono"
            type="text"
            className="input-form"
            value={patrono}
            onChange={(e) => setPatrono(e.target.value)}
            placeholder="Digite o nome completo do patrono..."
          />
        </div>

        <div className="form-grupo-duplo">
          <div className="form-group">
            <label htmlFor="cargo">Cargo / Categoria</label>
            <select
              id="cargo"
              className="select-form"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              <option value="Membro Titular">Membro Titular</option>
              <option value="Membro Emérito">Membro Emérito</option>
              <option value="Membro Correspondente">Membro Correspondente</option>
              <option value="Membro Honorário">Membro Honorário</option>
              <option value="Presidente">Presidente</option>
              <option value="Vice-Presidente">Vice-Presidente</option>
              <option value="Secretário Geral">Secretário Geral</option>
              <option value="Tesoureiro">Tesoureiro</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cadeira">Cadeira de Ocupação</label>
            <div className="input-prefix-group">
              <span className="input-prefix">Cadeira n°</span>
              <input
                id="cadeira"
                type="text"
                inputMode="numeric"
                className="input-com-prefixo"
                value={cadeiraOcupacao}
                onChange={(e) => {
                  // Permite digitar apenas números
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  setCadeiraOcupacao(apenasNumeros);
                }}
                placeholder="Ex: 15"
                maxLength={3}
              />
            </div>
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