import { useState } from 'react';
import logoAMC from '../assets/logo_amc2.png';
import { Link, useNavigate } from 'react-router-dom';
import './CadastroForm.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

//region DECLARACAO DE VARIAVEIS
export default function CadastroForm() {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();
//endregion

//region FUNÇÃO HANDLESUBMIT PARA COLETA DE DADOS
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem. Tente novamente!')
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name:nome, inviteCode:codigo, email:email, password:password })
      })

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        e.target.reset();
        return;
      } else {
        e.target.reset();
      }
      navigate('/login');
    } catch (error) {
      alert('erro ao conectar no servidor', error);
    }
  }
//endregion 

const bloquearAcao = (e) => {
    e.preventDefault(); 
    // Se quiser, você pode colocar um alert("Ação não permitida!"); aqui, 
    // mas a prática moderna recomenda apenas bloquear silenciosamente.
  };

  return (
    <div className='login-card-white'>
      <div className='page-titles'>
        <img src={logoAMC} alt="Logo AMC" className='amc-logo-center' style={{width: '60px' }} />
        <h1>Crie sua conta</h1>
        <p>Junte-se à Academia Maranhense de Ciências</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor="nome">NOME COMPLETO</label>
          <div className='input-wrapper'>
            <span className='input-icon'>👤</span>
            <input 
              type="text" 
              id='nome' 
              placeholder='Digite seu nome completo' 
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)} 
            />
          </div>
        </div>

        <div className='input-group'>
          <label htmlFor="codigo">CÓDIGO DE AUTORIZAÇÃO</label>
          <div className='input-wrapper'>
            <span className='input-icon'>🔑</span>
            <input 
              type="text" 
              id='codigo' 
              placeholder='Digite o código recebido' 
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
        </div>

        <div className='input-group'>
          <label htmlFor="email">E-MAIL</label>
          <div className='input-wrapper'>
            <span className='input-icon'>✉️</span>
            <input 
              type="email" 
              id='email' 
              placeholder='Digite seu e-mail' 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className='input-group'>
          <label htmlFor="password">SENHA</label>
          <div className='input-wrapper'>
            <span className='input-icon'>🔒</span>
            <input 
              type={mostrarSenha ? "text" : "password"} 
              id='password' 
              placeholder='Crie uma senha forte' 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}

              onCopy={bloquearAcao}
              onCut={bloquearAcao}
              onPaste={bloquearAcao}
            />
            <button 
              type="button" 
              className="btn-olhinho"
              onClick={() => setMostrarSenha(!mostrarSenha)} // Inverte o valor (de true para false e vice-versa)
            >
              {/* Mostra um ícone diferente se a senha estiver visível ou não */}
              {mostrarSenha ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        <div className='input-group'>
          <label htmlFor="confirm-password">CONFIRMAR SENHA</label>
          <div className='input-wrapper'>
            <span className='input-icon'>🔐</span>
            <input 
              type={mostrarSenha ? "text" : "password"} 
              id='confirm-password' 
              placeholder='Repita sua senha' 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
        </div>

        <button type='submit' className='btn-enter'>
          CADASTRAR
        </button>
      </form>

      <div className='register-area'>
        Já tem uma conta?{' '}
        <Link to="/" className='register-link'>
          Entrar
        </Link>
      </div>
    </div>
  )
}