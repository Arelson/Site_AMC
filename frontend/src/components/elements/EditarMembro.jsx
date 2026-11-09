import React, { useState, useEffect } from 'react';
import './CriarMembro.css'; // Reaproveita o mesmo CSS!

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function FormEditarMembro({ membroId, onVoltar }) {
  const [name, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [cadeiraOcupacao, setCadeiraOcupacao] = useState('');
  const [linkLattes, setLinkLattes] = useState('');
  const [bio, setBio] = useState('');
  
  // Estados para a Foto
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(true);

  // 1. Busca os dados atuais do Membro ao abrir a tela
  useEffect(() => {
    const carregarMembro = async () => {
      try {
        // Ajuste esta rota caso a sua rota de buscar membro por ID seja diferente
        const response = await fetch(`${apiURL}/api/auth/members/${membroId}`);
        
        if (response.ok) {
          const dados = await response.json();
          setNome(dados.name || '');
          setCargo(dados.cargo || '');
          setCadeiraOcupacao(dados.cadeiraOcupacao || '');
          setLinkLattes(dados.linkLattes || '');
          setBio(dados.bio || '');

          if (dados.avatarUrl) {
            setFotoPreview(`${apiURL}${dados.avatarUrl}`);
          } else if (dados.user && dados.user.avatarUrl) {
            // Pega a foto do usuário vinculado caso não tenha uma foto própria de membro
            setFotoPreview(`${apiURL}${dados.user.avatarUrl}`);
          }
        } else {
          setMensagem({ texto: 'Erro ao carregar dados do membro.', tipo: 'erro' });
        }
      } catch (error) {
        console.error("Erro ao buscar membro:", error);
        setMensagem({ texto: 'Erro de conexão.', tipo: 'erro' });
      } finally {
        setLoading(false);
      }
    };

    if (membroId) {
      carregarMembro();
    }
  }, [membroId]);

  // Lida com a seleção da nova foto no computador
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file)); // Mostra o preview na hora
    }
  };

  // 2. Envia os dados atualizados para o Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Salvando alterações...', tipo: 'loading' });

    // Como tem upload de foto (multer), OBRIGATORIAMENTE usamos FormData
    const formData = new FormData();
    formData.append('name', name);
    if (cargo) formData.append('cargo', cargo);
    if (cadeiraOcupacao) formData.append('cadeiraOcupacao', cadeiraOcupacao);
    if (linkLattes) formData.append('linkLattes', linkLattes);
    if (bio) formData.append('bio', bio);
    if (fotoFile) formData.append('foto', fotoFile);

    try {
      // Usando a rota de PUT que criamos no controlador do Admin
      const response = await fetch(`${apiURL}/api/admin/members/${membroId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Não coloque 'Content-Type' aqui. O FormData faz isso automaticamente!
        },
        body: formData
      });

      if (response.ok) {
        setMensagem({ texto: 'Perfil do membro atualizado com sucesso!', tipo: 'sucesso' });
        // Opcional: Voltar automaticamente após 2 segundos
        setTimeout(() => onVoltar(), 1000);
      } else {
        const erroData = await response.json();
        setMensagem({ texto: erroData.error || 'Erro ao atualizar.', tipo: 'erro' });
      }
    } catch (error) {
      console.error("Erro no envio:", error);
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  if (loading) {
    return <div className="form-admin-interno">Carregando dados do membro...</div>;
  }

  return (
    <div className="form-admin-interno">
      <div className="form-admin-header">
        <h2>EDITAR MEMBRO</h2>
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
              onChange={handleFotoChange} 
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
