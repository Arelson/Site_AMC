import React, { useEffect, useState } from 'react';
import './VisaoGeral.css';
import DashboardHeader from '../utils/DashboardHeader.jsx';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const acoesTraduzidas = {
  CREATE: { texto: 'Criou', classe: 'badge-create' },
  UPDATE: { texto: 'Editou', classe: 'badge-update' },
  DELETE: { texto: 'Apagou', classe: 'badge-delete' }
};

const entidadesTraduzidas = {
  News: 'Notícia',
  Member: 'Membro',
  InviteCode: 'Codigo de convite',
  Event: 'Evento',
  Post: 'Postagem',
  Article: 'Artigo',
  Settings: 'Configurações'
};

export default function VisaoGeral() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${apiURL}/api/logs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Erro ao carregar os logs", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);
  
  return (
    <div className='visao-geral'>
      <DashboardHeader />

      <section className='visao-geral-generalinfo'>
        <div className="card-info"></div>
        <div className="card-info"></div>
        <div className="card-info"></div>
        <div className="card-info"></div>        
      </section>

      <section className='visao-geral-recentactivity'>
        <h1 className='historico-titulo'>Histórico de Atividades</h1>
        
        <div className="table-container">
          <table className="historico-table">
            <thead>
              <tr>
                <th>Data e Hora</th>
                <th>Usuário Responsável</th>
                <th>Ação</th>
                <th>Item Afetado</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="table-empty">Carregando histórico...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="table-empty">Nenhuma atividade registrada ainda.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="col-data">
                      {new Date(log.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    <td className="col-usuario">
                      <div className="usuario-info">
                        <div className="avatar">
                          {log.user?.avatarUrl ? (
                            <img className='avatar' src={`${apiURL}${log.user.avatarUrl}`} alt="" />
                          ):(log.user.name.charAt(0).toUpperCase())}
                        </div>
                        <div className="usuario-textos">
                          <span className="usuario-nome">{log.user?.name || 'Usuário Desconhecido'}</span>
                          <span className="usuario-cargo">
                            {log.user?.role === 'ADMIN' ? 'Administrador' : 'Membro da Equipe'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="col-acao">
                      <span className={`badge ${acoesTraduzidas[log.action]?.classe || 'badge-default'}`}>
                        {acoesTraduzidas[log.action]?.texto || log.action}
                      </span>
                    </td>

                    <td className="col-item">
                      <span className="item-nome">{entidadesTraduzidas[log.entity] || log.entity}</span>
                      <span className="item-id">(ID: {log.entityId})</span>
                    </td>

                    <td className="col-detalhes">
                      {log.details?.title ? (
                        <span className="detalhe-texto">"{log.details.title}"</span>
                      ) : (
                        <span className="detalhe-vazio">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}