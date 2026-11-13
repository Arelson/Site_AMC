import React from 'react'
import './VisaoGeral.css'
import {useEffect, useState} from 'react';
import DashboardHeader from '../utils/DashboardHeader.jsx'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function VisaoGeral() {
  const [logs, setLogs] = useState([])

  
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${apiURL}/api/admin/logs`, {
      method: "GET",
      headers: {
         'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(data => setLogs(data)).catch(err => console.error("Erro ao carregar os logs", err))
  }, []);
  
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