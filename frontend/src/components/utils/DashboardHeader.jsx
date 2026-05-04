import React from 'react'
import './DashboardHeader.css'

export default function DashboardHeader() {
  const hoje = new Date();

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(hoje);

  const dataISO = hoje.toISOString().split('T')[0];

  return (
    <header className='visao-geral-header'>

      <div className='visao-geral-header-title'>
        <h1>Painel de Controle</h1>
        <p>Bem vindo, gerencie o conteúdo e informações da AMC</p>
      </div>

      <time dateTime={dataISO} style={{ textTransform: 'capitalize' }}>{dataFormatada.toUpperCase()}</time>

    </header>
  )
}