import React, { useState, useEffect } from 'react';
import './GestaoConteudo.css';
import DashboardHeader from '../utils/DashboardHeader';
import { Link } from 'react-router-dom';
import GestaoNoticias from '../utils/GestaoNoticias';
import GestaoBlogMember from '../utils/GestaoBlogMember.jsx';
import GestaoEventos from '../utils/GestaoEventos.jsx'



export default function GestaoConteudo({handleCriarPost=() => {}, handleEditarPost=() => {}, adm}) {
  const [membros, setMembros] = useState(true);
  const [noticias, setNoticias] = useState(false);
  const [eventos, setEventos] = useState(false);
  const [revistasEbooks, setRevistasEbooks] = useState(false);
  const [documentosPublicos, setDocumentosPublicos] = useState(false);
  const [blog, setBlog] = useState(false);
  const [invitePopup, setInvitePopup] = useState(false);
  const [invites, setInvites] = useState([]);
  const [codeGenerated, setCodeGenerated] = useState('');
  const [copy, setCopy] = useState(false);

  
  
  useEffect(() => {
    const requireInvites = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/invites', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        const data = await response.json();
        setInvites(data);
      } catch (error) {
        console.error('Erro ao buscar convites:', error);
      }
    }
    if (adm) {
      requireInvites();
    }
  }, [adm]);
  
// TODO: TALVEZ EXCLUIR
  const handleGeneratedCode = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/invites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCodeGenerated(data.code);
        setInvitePopup(true);
        setInvites(prev => [data, ...prev]);
      } else {
        alert('Erro ao gerar convite');
      }
    } catch (error) {
      alert('Erro ao gerar código no servidor: ', error);
    }
  }

  const handleCopiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codeGenerated);
      setCopy(true);
      setTimeout(() => {
        setCopy(false);
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
      alert('Erro ao copiar o código.');
    }
  };

  // TODO: TALVEZ EXCLUIR
  const handleDeleteCode = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este código?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/admin/invites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setInvites(invites.filter(invite => invite.id !== id));
      } else {
        alert('Erro ao tentar excluir código no servidor.');
      }
    } catch (error) {
      alert('Erro de conexão ao exluir código: ', error);
    }
  }

  const handleMembroClick = () => {
    setMembros(true);
    setNoticias(false);
    setEventos(false);
    setRevistasEbooks(false);
    setDocumentosPublicos(false);
    setBlog(false);
    setInvitePopup(false);
  }

  const handleNoticiaClick = () => {
    setNoticias(true);
    setMembros(false);
    setEventos(false);
    setRevistasEbooks(false);
    setDocumentosPublicos(false);
    setBlog(false);
    setInvitePopup(false);
  }

  const handleEventoClick = () => {
    setEventos(true);
    setNoticias(false);
    setMembros(false);
    setRevistasEbooks(false);
    setDocumentosPublicos(false);
    setBlog(false);
    setInvitePopup(false);
  }

  const handleRevistasEbooksClick = () => {
    setRevistasEbooks(true);
    setNoticias(false);
    setEventos(false);
    setMembros(false);
    setDocumentosPublicos(false);
    setBlog(false);
    setInvitePopup(false);
  }

  const handleDocumentosPublicosClick = () => {
    setDocumentosPublicos(true);
    setNoticias(false);
    setEventos(false);
    setMembros(false);
    setRevistasEbooks(false);
    setBlog(false);
    setInvitePopup(false);
  }

  const handleBlogClick = () => {
    setBlog(true);
    setNoticias(false);
    setEventos(false);
    setMembros(false);
    setRevistasEbooks(false);
    setDocumentosPublicos(false);
    setInvitePopup(false);
  }

  return (
    <>
      {!adm && <GestaoBlogMember handleCriarPost={handleCriarPost} handleEditarPost={handleEditarPost} adm />}
      {adm &&
      <div className='gestao-conteudo'>
        <DashboardHeader />
        <section className='gestao-conteudo-content'>
          <div className='gestao-conteudo-content-title-adm'>
            <h1 onClick={handleMembroClick} className={`gestao-conteudo-content-title-adm-h1 ${membros ? 'Active' : 'Inactive'}`}>MEMBROS</h1>
            <h1 onClick={handleNoticiaClick} className={`gestao-conteudo-content-title-adm-h1 ${noticias ? 'Active' : 'Inactive'}`}>NOTÍCIAS</h1>
            <h1 onClick={handleEventoClick} className={`gestao-conteudo-content-title-adm-h1 ${eventos ? 'Active' : 'Inactive'}`}>EVENTOS</h1>
            <h1 onClick={handleRevistasEbooksClick} className={`gestao-conteudo-content-title-adm-h1 ${revistasEbooks ? 'Active' : 'Inactive'}`}>REVISTAS/EBOOKS</h1>
            <h1 onClick={handleDocumentosPublicosClick} className={`gestao-conteudo-content-title-adm-h1 ${documentosPublicos ? 'Active' : 'Inactive'}`}>DOCUMENTOS PÚBLICOS</h1>
            <h1 onClick={handleBlogClick} className={`gestao-conteudo-content-title-adm-h1 ${blog ? 'Active' : 'Inactive'}`}>BLOG</h1>
          </div>
          <hr className='linha-divisoria'/>

          <>
            {membros && 
            <>
              <div className='gestao-conteudo-content-addvlog'>
                <h2>GESTÃO DE MEMBROS</h2>
                <div>
                  <a href="#"><span>+</span>Novo Membro</a>
                  <a href="#" onClick={ handleGeneratedCode }><span>+</span>Novo Código de Convite</a>
                </div>
              </div>
              <div className='invites'>
                <h3 className='invites-title'>Códigos de Convite</h3>
                <div className = 'invites-table-header'>
                  <span>CÓDIGO</span>
                  <span>STATUS</span>
                  <span>AÇÃO</span>
                </div>

                <div className = 'invites-table'>
                  {invites.length === 0 ? (
                    <p>Nenhum código gerado ainda</p>
                  ):(
                    invites.map((invite) => (
                      <div className='invites-table-content' key={invite.id}>
                        <div className='invites-table-content-code'>{invite.code}</div>
                        <div className='invites-table-content-status'>
                          <span className={invite.isUsed ? 'status-utilizado' : 'status-disponivel'}> {invite.isUsed ? 'UTILIZADO' : 'DISPONÍVEL'}</span>
                        </div>
                        <div className='invites-table-content-actions'>
                          <button onClick={() => handleDeleteCode(invite.id)}>EXCLUIR</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
            }
            {invitePopup &&
            <>
              <div className='popup-container'>
                <div className='popup-content'>
                  <h2>Código Gerado!</h2>
                  <p>Envie o código abaixo para o novo membro se cadastrar:</p>
                  <div className='popup-content-code'>{codeGenerated}</div>
                  <button className='popup-content-buttonClose' onClick={() => setInvitePopup(false)}>X</button>
                  <button className={`popup-content-buttonCopy ${copy ? 'copiado' : ''}`} onClick={handleCopiarCodigo}>{copy? 'COPIADO!': `COPIAR CÓDIGO`}</button>
                </div>
              </div>
            </>
            }
            {noticias && 
            <GestaoNoticias />
            }
            {eventos && <GestaoEventos />
            }
            {revistasEbooks && 
            <p>Gestão de Revistas/Ebooks - Em construção...</p>
            }
            {documentosPublicos && 
            <p>Gestão de Documentos Públicos - Em construção...</p>
            }
            {blog && 
            <p>Gestão de Blog - Em construção...</p>
            }
          </>
        </section>
      </div>
      }
    </>
  );
}