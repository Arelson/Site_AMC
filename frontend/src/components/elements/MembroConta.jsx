import { useState, useEffect } from 'react'
import DashboardHeader from '../utils/DashboardHeader'
import './MinhaConta.css' // Reaproveitando o mesmo CSS
import { Link } from 'react-router-dom'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MeuPerfil() {
  // Estados baseados no seu model Member do Prisma
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [cadeiraOcupacao, setCadeiraOcupacao] = useState('');
  const [linkLattes, setLinkLattes] = useState('');
  const [bio, setBio] = useState('');
  const [fotoFile, setFotoFile] = useState(null); // O arquivo real para enviar ao backend
  const [fotoPreview, setFotoPreview] = useState(''); // A URL para mostrar na tela
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Dispara assim que a tela abre
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const response = await fetch(`${apiURL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const dadosDoBanco = await response.json();
          
          // Preenche os inputs com os dados que vieram do Prisma!
          // Usamos || '' para evitar que o React reclame de valores null
          setNome(dadosDoBanco.name || '');
          setCargo(dadosDoBanco.cargo || '');
          setCadeiraOcupacao(dadosDoBanco.cadeiraOcupacao || '');
          setLinkLattes(dadosDoBanco.linkLattes || '');
          setBio(dadosDoBanco.bio || '');
          setEmail(dadosDoBanco.email || '');
          
          if (dadosDoBanco.avatarUrl) {
            setFotoPreview(`${apiURL}${dadosDoBanco.avatarUrl}`);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar os dados do perfil:", error);
      }
    };

    carregarPerfil();
  }, []); // A array vazia [] garante que isso só rode 1 vez quando a tela abrir

  // Função que roda assim que o usuário escolhe uma foto no PC
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file); // Guarda o arquivo para o upload
      setFotoPreview(URL.createObjectURL(file)); // Cria um link temporário para mostrar na tela
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Monta o objeto apenas com os campos que o usuário preencheu
    const dataForUpdate = {};
    if (nome) dataForUpdate.nome = nome;
    if (cargo) dataForUpdate.cargo = cargo;
    if (cadeiraOcupacao) dataForUpdate.cadeiraOcupacao = cadeiraOcupacao;
    if (linkLattes) dataForUpdate.linkLattes = linkLattes;
    if (bio) dataForUpdate.bio = bio;

    // Como tem arquivo (foto), OBRIGATORIAMENTE usamos FormData
    const formData = new FormData();
    if (email) formData.append('email', email);
    
    // Só envia a senha se o usuário digitou uma nova
    if (senha) formData.append('password', senha);
    
    // Só anexa a foto se ele selecionou uma nova
    if (fotoFile) formData.append('foto', fotoFile);

    if (Object.keys(dataForUpdate).length === 0) {
      alert('Preencha pelo menos um campo para atualizar o perfil');
      return;
    }

    try {
      // Ajuste a rota para a sua rota de atualização de membro no backend
      const response = await fetch(`${apiURL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataForUpdate)
      });

      if (response.ok) {
        alert('Perfil público atualizado com sucesso!');
        // Limpa os campos após o sucesso
        // setNome('');
        // setCargo('');
        // setCadeiraOcupacao('');
        // setLinkLattes('');
        // setBio('');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message || 'Não foi possível atualizar o perfil'}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error.message);
      alert(`Erro de conexão com o servidor. ${error.message}`);
    }

    try {
      // Ajuste para a rota unificada que criamos no backend (ex: /api/users/minha-conta)
      const response = await fetch(`${apiURL}/api/auth/account`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // ATENÇÃO: NÃO coloque 'Content-Type' aqui. 
          // O navegador calcula automaticamente quando usamos FormData!
        },
        body: formData
      });

      if (response.ok) {
        alert('Conta atualizada com sucesso!');
        setSenha(''); // Limpa o campo de senha por segurança
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Não foi possível atualizar a conta'}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert('Erro de conexão com o servidor.');
    }
  }
  
  return (
    <>
    <div className='conta-container'>
      <div className='conta-content'>
        <h2 className='conta-content-title'>Perfil Público (Membros)</h2>
        <form onSubmit={handleSubmit} className='conta-content-form'>
          
          <div className='conta-content-form-item'>
            <label htmlFor="nome">NOME DE EXIBIÇÃO</label>
            <div className='conta-content-form-input'>
              <span className='conta-content-form-input-icon'>👤</span>
              <input
                type="text"
                id='nome'
                placeholder='Como seu nome deve aparecer no site'
                value={nome}
                onChange={(e) => setNome(e.target.value)} 
              />
            </div>
          </div>

          <div className='conta-content-form-password'>
            <div className='conta-content-form-item'>
              <label htmlFor="cargo">CARGO</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>💼</span>
                <input
                  type="text"
                  id='cargo'
                  placeholder='Ex: Diretor de Projetos'
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)} 
                />
              </div>
            </div>

            <div className='conta-content-form-item'>
              <label htmlFor="cadeiraOcupacao">CADEIRA DE OCUPAÇÃO</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>🪑</span>
                <input
                  type="text"
                  id='cadeiraOcupacao'
                  placeholder='Ex: Cadeira nº 5'
                  value={cadeiraOcupacao}
                  onChange={(e) => setCadeiraOcupacao(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className='conta-content-form-item'>
            <label htmlFor="linkLattes">LINK DO CURRÍCULO LATTES</label>
            <div className='conta-content-form-input'>
              <span className='conta-content-form-input-icon'>🔗</span>
              <input
                type="url"
                id='linkLattes'
                placeholder='https://lattes.cnpq.br/...'
                value={linkLattes}
                onChange={(e) => setLinkLattes(e.target.value)} 
              />
            </div>
          </div>

          <div className='conta-content-form-item'>
            <label htmlFor="bio">BIOGRAFIA</label>
            <div className='conta-content-form-input' style={{ height: 'auto', padding: '10px' }}>
              <span className='conta-content-form-input-icon' style={{ alignSelf: 'flex-start' }}>📝</span>
              <textarea
                id='bio'
                placeholder='Escreva um breve resumo sobre você e sua trajetória...'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ 
                  width: '100%', 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                  minHeight: '100px',
                  resize: 'vertical',
                  marginLeft: '10px',
                  color: 'inherit'
                }} 
              />
            </div>
          </div>
          
          <button type='submit' className='conta-content-form-button'> SALVAR PERFIL </button>
                  
        </form>
    </div>
    </div>
    
    <div className='conta-container'>
    <div className='conta-content'>
      <h2 className='conta-content-title'>Configurações da Conta</h2>
      
      <form onSubmit={handleSubmit} className='conta-content-form'>
        
        {/* ÁREA DA FOTO DE PERFIL */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div 
            style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              backgroundColor: '#eaeaea', overflow: 'hidden', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '3px solid #0056b3', marginBottom: '10px'
            }}
          >
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview do Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px', color: '#888' }}>
                {nome ? nome.charAt(0).toUpperCase() : '👤'}
              </span>
            )}
          </div>
          
          {/* Botão de upload camuflado */}
          <label style={{ cursor: 'pointer', color: '#0056b3', fontWeight: 'bold', fontSize: '14px' }}>
            ✏️ Alterar Foto de Perfil
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFotoChange} 
              style={{ display: 'none' }} // Esconde o input feio do navegador
            />
          </label>
        </div>

        {/* CAMPOS DE TEXTO */}
        <div className='conta-content-form-item'>
          <label htmlFor="nome">NOME COMPLETO</label>
          <div className='conta-content-form-input'>
            <span className='conta-content-form-input-icon'>👤</span>
            <input
              type="text"
              id='nome'
              placeholder='Seu nome completo'
              value={nome}
              onChange={(e) => setNome(e.target.value)} 
              required
            />
          </div>
        </div>

        <div className='conta-content-form-item'>
          <label htmlFor="email">E-MAIL DE ACESSO</label>
          <div className='conta-content-form-input'>
            <span className='conta-content-form-input-icon'>✉️</span>
            <input
              type="email"
              id='email'
              placeholder='exemplo@amc.com.br'
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
        </div>

        <div className='conta-content-form-item'>
          <label htmlFor="senha">NOVA SENHA (OPCIONAL)</label>
          <div className='conta-content-form-input'>
            <span className='conta-content-form-input-icon'>🔒</span>
            <input
              type="password"
              id='senha'
              placeholder='Digite apenas se quiser alterar a atual'
              value={senha}
              onChange={(e) => setSenha(e.target.value)} 
            />
          </div>
          <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>
            Deixe em branco para manter a senha atual. Se for alterar, use no mínimo 8 caracteres com letras, números e símbolos.
          </small>
        </div>
        
        <button type='submit' className='conta-content-form-button' style={{ marginTop: '20px' }}> 
          SALVAR ALTERAÇÕES DA CONTA 
        </button>
              
      </form>
    </div>
    </div>
    </>
  )
}