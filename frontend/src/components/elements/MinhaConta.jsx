import { useState } from 'react'
import DashboardHeader from '../utils/DashboardHeader'
import './MinhaConta.css'
import { Link } from 'react-router-dom'


export default function MinhaConta() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!email && !password) {
      alert('Preencha o e-mail ou a senha para atualizar');
      return;
    }
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        alert('As senhas não coincidem. Tente novamente!');
        return;
      }
    }
    const dataForUpdate = {};
    if (email) dataForUpdate.email = email;
    if (password) dataForUpdate.password = password;

    try {
      const response = await fetch('http://localhost:3000/api/admin/update', {
        method: 'PATCH',
        headers:{
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataForUpdate)
      });
      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message || 'Não foi possível atualizar o perfil'}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert('Erro de conexão com o servidor.');
    }
  }
  
  return (
    <div className='conta-container'>
      <DashboardHeader />
      <div className='conta-content'>
        <h2 className='conta-content-title'>Configurações de Acesso</h2>
        <form onSubmit={handleSubmit} className='conta-content-form'>
          <div className='conta-content-form-item'>
            <label htmlFor="email">E-MAIL</label>
            <div className='conta-content-form-input'>
              <span className='conta-content-form-input-icon'>✉️</span>
              <input
                type="email"
                id='email'
                placeholder='Digite seu e-mail'
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className='conta-content-form-password'>
            <div className='conta-content-form-item'>
              <label htmlFor="password">SENHA</label>
              <div className='conta-content-form-input'>
                <span className='conta-content-form-input-icon'>🔒</span>
                <input
                  type="password"
                  id='password'
                  placeholder='Digite a senha nova'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
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
          </div>
          
          <button type='submit' className='conta-content-form-button'> SALVAR ALTERAÇÕES </button>
                  
        </form>
      </div>
    </div>
  )
}