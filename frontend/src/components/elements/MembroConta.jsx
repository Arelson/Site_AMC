import { useState, useEffect } from 'react';
import './MinhaConta.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MeuPerfil() {
  // Estados do perfil de membro e conta
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('Membro Titular');
  const [cadeiraOcupacao, setCadeiraOcupacao] = useState('');
  const [patrono, setPatrono] = useState('');
  const [linkLattes, setLinkLattes] = useState('');
  const [bio, setBio] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

          setNome(dadosDoBanco.name || '');
          setCargo(dadosDoBanco.cargo || 'Membro Titular');
          // Extrai apenas os números de "Cadeira n° 05" -> "05"
          setCadeiraOcupacao(
            dadosDoBanco.cadeiraOcupacao
              ? String(dadosDoBanco.cadeiraOcupacao).replace(/\D/g, '')
              : ''
          );
          setPatrono(dadosDoBanco.patrono || dadosDoBanco.patronoId || '');
          setLinkLattes(dadosDoBanco.linkLattes || '');
          setBio(dadosDoBanco.bio || '');
          setEmail(dadosDoBanco.email || dadosDoBanco.user?.email || '');

          const avatar = dadosDoBanco.avatarUrl || dadosDoBanco.user?.avatarUrl;
          if (avatar && avatar !== 'default.png') {
            setFotoPreview(avatar.startsWith('http') ? avatar : `${apiURL}${avatar}`);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar os dados do perfil:', error);
      }
    };

    carregarPerfil();
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha || confirmPassword) {
      if (senha !== confirmPassword) {
        alert('As senhas não coincidem. Tente novamente!');
        return;
      }
    }

    const formData = new FormData();

    // Dados do Perfil Público (Member)
    if (nome) formData.append('name', nome);
    if (cargo) formData.append('cargo', cargo);
    if (cadeiraOcupacao) {
      formData.append('cadeiraOcupacao', `Cadeira n° ${cadeiraOcupacao.padStart(2, '0')}`);
    }
    if (patrono) formData.append('patrono', patrono);
    if (linkLattes) formData.append('linkLattes', linkLattes);
    if (bio) formData.append('bio', bio);

    // Dados da Conta (User)
    if (email) formData.append('email', email);
    if (senha) formData.append('password', senha);
    if (fotoFile) formData.append('foto', fotoFile);

    try {
      const response = await fetch(`${apiURL}/api/auth/account`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        // Mantém o nome sincronizado no Header se o usuário alterar
        if (nome) localStorage.setItem('nomeCompleto', nome);

        alert('Perfil e conta atualizados com sucesso!');
        setSenha('');
        setConfirmPassword('');
        setFotoFile(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Erro: ${errorData.error || 'Não foi possível atualizar a conta'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <>
      {/* CARD 1: PERFIL PÚBLICO */}
      <div className='conta-container'>
        <div className='conta-content'>
          <h2 className='conta-content-title'>Perfil Público (Membros)</h2>
          <form onSubmit={handleSubmit} className='conta-content-form'>

            <div className='conta-content-form-item'>
              <label htmlFor="nome-perfil">NOME DE EXIBIÇÃO</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>👤</span>
                <input
                  type="text"
                  id='nome-perfil'
                  placeholder='Como seu nome deve aparecer no site'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>

            <div className='conta-content-form-password'>
              {/* SELECT DE CARGO */}
              <div className='conta-content-form-item'>
                <label htmlFor="cargo">CARGO / CATEGORIA</label>
                <div className='conta-content-form-input'>
                  <span className='conta-content-form-input-icon'>💼</span>
                  <select
                    id='cargo'
                    className='conta-select-input'
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
              </div>

              {/* CADEIRA COM PREFIXO FIXO */}
              <div className='conta-content-form-item'>
                <label htmlFor="cadeiraOcupacao">CADEIRA DE OCUPAÇÃO</label>
                <div className='conta-content-form-input conta-input-prefix-wrapper'>
                  <span className='conta-content-form-input-icon'>🪑</span>
                  <span className='conta-input-prefix'>Cadeira n°</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id='cadeiraOcupacao'
                    placeholder='Ex: 05'
                    maxLength={3}
                    value={cadeiraOcupacao}
                    onChange={(e) => {
                      const apenasNumeros = e.target.value.replace(/\D/g, '');
                      setCadeiraOcupacao(apenasNumeros);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* NOVO CAMPO: PATRONO */}
            <div className='conta-content-form-item'>
              <label htmlFor="patrono">NOME DO PATRONO</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>🏛️</span>
                <input
                  type="text"
                  id='patrono'
                  placeholder='Digite o nome completo do patrono da cadeira'
                  value={patrono}
                  onChange={(e) => setPatrono(e.target.value)}
                />
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

            <button type='submit' className='conta-content-form-button'>
              SALVAR PERFIL
            </button>
          </form>
        </div>
      </div>

      {/* CARD 2: CONFIGURAÇÕES DA CONTA */}
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

              <label style={{ cursor: 'pointer', color: '#0056b3', fontWeight: 'bold', fontSize: '14px' }}>
                ✏️ Alterar Foto de Perfil
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className='conta-content-form-item'>
              <label htmlFor="nome-conta">NOME COMPLETO</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>👤</span>
                <input
                  type="text"
                  id='nome-conta'
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
                  placeholder='exemplo@amc-ma.org'
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

            <div className='conta-content-form-item'>
              <label htmlFor="confirmPassword">CONFIRMAR SENHA</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>🔐</span>
                <input
                  type="password"
                  id='confirmPassword'
                  placeholder='Repita a senha'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type='submit' className='conta-content-form-button' style={{ marginTop: '20px' }}>
              SALVAR ALTERAÇÕES DA CONTA
            </button>
          </form>
        </div>
      </div>
    </>
  );
}