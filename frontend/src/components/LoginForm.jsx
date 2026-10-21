import logoAMC from '../assets/logo_amc2.png';
import './LoginForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function LoginForm() {
  //region DECLARACAO DE VARIAVEIS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  //endregion

  //region FUNÇÃO HANDLESUBMIT
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('nomeCompleto', data.user.name);
        console.log(data);
        if (data.user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else if (data.user.role === 'MEMBER') {
          navigate('/dashboard/member');
        } else {
          alert('Você não tem permissão para acessar esse portal');
        }
      } else {
        alert(data.error, 'erro ao fazer login');
      }
    } catch (error) {
      alert('erro ao conectar no servidor', error);
    }
  }
  //endregion

  const bloquearAcao = (e) => {
    e.preventDefault(); 
  };

  //region RETURN
  return (
    <div className='login-card-white'>
      <div className='page-titles'>
        <img src={logoAMC} alt="Logo AMC" className='amc-logo-center' style={{width: '60px'}} />
        <h1>Bem-vindo</h1>
        <p>Acesse o portal da Academia</p>
      </div>

      <form onSubmit={handleSubmit}>
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
          <div className='label-row'>
            <label htmlFor="password">SENHA</label>
            <a href="#" className='forgot-password'>Esqueceu a senha?</a>
          </div>
          <div className='input-wrapper'>
            <span className='input-icon'>🔒</span>
            <input 
              type={mostrarSenha ? "text" : "password"} 
              id='password' 
              placeholder='Digite sua senha' 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}

              onPaste={bloquearAcao}
              onCut={bloquearAcao}
              onCopy={bloquearAcao}
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

        <button type='submit' className='btn-enter'>
          ENTRAR
        </button>
      </form>

      <div className='register-area'>
        Ainda não tem acesso? {' '}
        <Link to="/cadastro" className='register-link' style={{ color:'#eab308', fontWeight: 'bold', textDecoration: 'none'}}>
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}
//endregion