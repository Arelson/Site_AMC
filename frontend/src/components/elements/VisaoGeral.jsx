import React from 'react'
import './VisaoGeral.css'
import DashboardHeader from '../utils/DashboardHeader.jsx'


export default function VisaoGeral() {
  
  return (
    <div className='visao-geral'>
      <DashboardHeader />

      <section className='visao-geral-generalinfo'>
        <div>
        </div>

        <div>
        </div>

        <div>
        </div>

        <div>
        </div>        
      </section>

      <section className='visao-geral-recentactivity'>
        <h1 className='visao-geral-recentactivity-title'>Atividades Recentes</h1>
        <div className='visao-geral-recentactivity-content'></div>
        <div className='visao-geral-recentactivity-content'></div>
        <div className='visao-geral-recentactivity-content'></div>
        <div className='visao-geral-recentactivity-content'></div>
        <div className='visao-geral-recentactivity-content'></div>

      </section>
      
    </div>
  )
}