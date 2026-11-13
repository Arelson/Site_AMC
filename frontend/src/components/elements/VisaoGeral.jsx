import React from 'react'
import './VisaoGeral.css'
import {useEffect, useState} from 'react';
import DashboardHeader from '../utils/DashboardHeader.jsx'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function VisaoGeral() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch(`${apiURL}/api/admin/logs`).then(res => res.json()).then(data => setLogs(data)).catch(err => console.error("Erro ao carregar os logs", err))
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
       <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Data e Hora</th>
              <th className="p-4 font-semibold text-gray-600">Administrador</th>
              <th className="p-4 font-semibold text-gray-600">Ação</th>
              <th className="p-4 font-semibold text-gray-600">Item Afetado</th>
              <th className="p-4 font-semibold text-gray-600">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="p-4 font-medium">{log.user?.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${acoesTraduzidas[log.action]?.cor || 'bg-gray-100 text-gray-800'}`}>
                    {log.action?.texto || log.action}
                  </span>
                </td>
                <td className="p-4 text-gray-700">
                  {log.entity || log.entity} (ID: {log.entityId})
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {/* Mostra o título da notícia alterada se existir no JSON de detalhes */}
                  {log.details?.title ? `"${log.details.title}"` : 'Sem detalhes extra'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </section>
      
    </div>
  )
}