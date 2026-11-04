import React, { useState, useEffect } from 'react';
import './GestaoConteudo.css';
import DashboardHeader from '../utils/DashboardHeader';
import { Link } from 'react-router-dom';
import GestaoNoticias from '../utils/GestaoNoticias';
import GestaoBlogMember from '../utils/GestaoBlogMember.jsx';
import GestaoEventos from '../utils/GestaoEventos.jsx'
import GestaoBlogAdmin from '../utils/GestaoBlogAdm.jsx';
import GestaoArtigosMember from '../utils/GestaoArtigoMember.jsx';
import FormCriarMembro from './CriarMembro.jsx';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoConteudo({
  handleCriarPost = () => { },
  handleEditarPost = () => { },
  handleCriarArtigo = () => { },
  handleEditarArtigo = () => { }, 
  adm 
}) {
  
  // Estados Principais de Navegação
  const [membros, setMembros] = useState(true);
  const [noticias, setNoticias] = useState(false);
  const [eventos, setEventos] = useState(false);
  const [revistasEbooks, setRevistasEbooks] = useState(false);
  const [documentosPublicos, setDocumentosPublicos] = useState(false);
  const [blog, setBlog] = useState(false);
  
  // Estados da Gestão de Membros (Admin)
  const [invitePopup, setInvitePopup] = useState(false);
  const [invites, setInvites] = useState([]);
  const [codeGenerated, setCodeGenerated] = useState('');
  const [copy, setCopy] = useState(false);
  const [criandoMembro, setCriandoMembro] = useState(false);
  
  // Novos Estados para a reorganização
  const [abaMembro, setAbaMembro] = useState('BLOG'); // Abas do Membro Comum
  const [abaMembrosAdmin, setAbaMembrosAdmin] = useState('REGISTRADOS'); // Abas do Admin ('REGISTRADOS' ou 'CODIGOS')
  const [membrosLista, setMembrosLista] = useState([]); // Guarda a lista de membros do banco
  
  useEffect(() => {
    const requireInvites = async () => {
      try {
        const response = await fetch(`${apiURL}/api/admin/invites`, {
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

    // NOVA FUNÇÃO: Busca os membros cadastrados para preencher a tabela
    const requireMembers = async () => {
      try {
        const response = await fetch(`${apiURL}/api/auth/members`);
        if (response.ok) {
          const data = await response.json();
          setMembrosLista(data);
        }
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      }
    }

    if (adm) {
      requireInvites();
      requireMembers();
    }
  }, [adm]);
  
  const handleGeneratedCode = async () => {
    try {
      const response = await fetch(`${apiURL}/api/admin/invites`, {
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
        setAbaMembrosAdmin('CODIGOS'); // Já muda pra aba de códigos pra ele ver na lista
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

  const handleDeleteCode = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este código?')) return;
    try {
      const response = await fetch(`${apiURL}/api/admin/invites/${id}`, {
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

  // Funções de Navegação Principal
  const handleMembroClick = () => {
    setMembros(true);
    setNoticias(false);
    setEventos(false);
    setRevistasEbooks(false);
    setDocumentosPublicos(false);
    setBlog(false);
    setInvitePopup(false);
    setCriandoMembro(false);
  }

  const handleNoticiaClick = () => {
    setNoticias(true); setMembros(false); setEventos(false);
    setRevistasEbooks(false); setDocumentosPublicos(false); setBlog(false);
    setInvitePopup(false);
  }

  const handleEventoClick = () => {
    setEventos(true); setNoticias(false); setMembros(false);
    setRevistasEbooks(false); setDocumentosPublicos(false); setBlog(false);
    setInvitePopup(false);
  }

  const handleRevistasEbooksClick = () => {
    setRevistasEbooks(true); setNoticias(false); setEventos(false);
    setMembros(false); setDocumentosPublicos(false); setBlog(false);
    setInvitePopup(false);
  }

  const handleDocumentosPublicosClick = () => {
    setDocumentosPublicos(true); setNoticias(false); setEventos(false);
    setMembros(false); setRevistasEbooks(false); setBlog(false);
    setInvitePopup(false);
  }

  const handleBlogClick = () => {
    setBlog(true); setNoticias(false); setEventos(false);
    setMembros(false); setRevistasEbooks(false); setDocumentosPublicos(false);
    setInvitePopup(false);
  }

  return (
    <>
      {/* ==================================================== */}
      {/* ================= PAINEL DO MEMBRO ================= */}
      {/* ==================================================== */}
      {!adm && (
        <div className='gestao-conteudo'>
          <DashboardHeader />

          <section className='gestao-conteudo-content'>

            <div className='gestao-conteudo-content-title-adm'>
              <h1
                onClick={() => setAbaMembro('BLOG')}
                className={`gestao-conteudo-content-title-adm-h1 ${abaMembro === 'BLOG' ? 'Active': 'Inactive'}`}
              >MEU BLOG</h1>

              <h1
                onClick={() => setAbaMembro('ARTIGO')}
                className={`gestao-conteudo-content-title-adm-h1 ${abaMembro === 'ARTIGO' ? 'Active': 'Inactive'}`}
              >
                MEUS ARTIGOS
              </h1>
            </div>

            <hr className='linha-divisoria' />
            
            {abaMembro === 'BLOG' && (
              <GestaoBlogMember handleCriarPost={handleCriarPost} handleEditarPost={handleEditarPost} />
            )}
            {abaMembro === 'ARTIGO' && (
              <GestaoArtigosMember handleCriarArtigo={handleCriarArtigo} handleEditarArtigo={handleEditarArtigo} />
            )}
          </section>
        </div>
      )}


      {/* ==================================================== */}
      {/* ================= PAINEL DO ADMIN ================== */}
      {/* ==================================================== */}
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
            {/* GESTÃO DE MEMBROS ATIVA */}
            {membros && (
              criandoMembro ? (
                // Mostra o formulário e passa a função para voltar
                <FormCriarMembro onVoltar={() => setCriandoMembro(false)} />
              ) : (
                <>
                  <div className='gestao-conteudo-content-addvlog'>
                    <h2>GESTÃO DE MEMBROS</h2>
                    <div>
                      <a href="#" onClick={(e) => { e.preventDefault(); setCriandoMembro(true); }}>
                        <span>+</span>Novo Membro
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratedCode(); }}>
                        <span>+</span>Novo Código de Convite
                      </a>
                    </div>
                  </div>

                  {/* SUB-ABAS DA GESTÃO DE MEMBROS (Reaproveitando seu CSS) */}
                  <div className='gestao-conteudo-content-title-adm' style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <h1 
                      onClick={() => setAbaMembrosAdmin('REGISTRADOS')} 
                      className={`gestao-conteudo-content-title-adm-h1 ${abaMembrosAdmin === 'REGISTRADOS' ? 'Active' : 'Inactive'}`} 
                      style={{ fontSize: '15px' }}
                    >
                      MEMBROS REGISTRADOS
                    </h1>
                    <h1 
                      onClick={() => setAbaMembrosAdmin('CODIGOS')} 
                      className={`gestao-conteudo-content-title-adm-h1 ${abaMembrosAdmin === 'CODIGOS' ? 'Active' : 'Inactive'}`} 
                      style={{ fontSize: '15px' }}
                    >
                      CÓDIGOS DE CONVITE
                    </h1>
                  </div>

                  {/* ================= ABA: MEMBROS REGISTRADOS ================= */}
                  {abaMembrosAdmin === 'REGISTRADOS' && (
                    <div className='invites'>
                      <h3 className='invites-title'>Lista de Membros Atuais</h3>
                      
                      {/* Grid de 4 colunas (adaptado inline do seu CSS) */}
                      <div className='invites-table-header' style={{ gridTemplateColumns: '2fr 2fr 2fr 1fr' }}>
                        <span>NOME / DR(A).</span>
                        <span>CARGO / POSIÇÃO</span>
                        <span>E-MAIL</span>
                        <span>AÇÕES</span>
                      </div>

                      <div className='invites-table'>
                        {membrosLista.length === 0 ? (
                          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Nenhum membro encontrado.</p>
                        ) : (
                          membrosLista.map((membro) => (
                            <div className='invites-table-content' key={membro.id} style={{ gridTemplateColumns: '2fr 2fr 2fr 1fr' }}>
                              <div className='invites-table-content-code' style={{ fontWeight: 'bold' }}>{membro.name}</div>
                              <div className='invites-table-content-status' style={{ color: '#555' }}>
                                {membro.cargo || 'Membro'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {membro.email || (membro.user && membro.user.email) || 'Sem e-mail'}
                              </div>
                              <div className='invites-table-content-actions'>
                                <button style={{ backgroundColor: '#0056b3' }}>EDITAR</button>
                                {/* <button style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}>EXCLUIR</button> */}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ================= ABA: CÓDIGOS DE CONVITE ================= */}
                  {abaMembrosAdmin === 'CODIGOS' && (
                    <div className='invites'>
                      <h3 className='invites-title'>Códigos de Convite</h3>
                      <div className = 'invites-table-header'>
                        <span>CÓDIGO</span>
                        <span>STATUS</span>
                        <span>AÇÃO</span>
                      </div>

                      <div className = 'invites-table'>
                        {invites.length === 0 ? (
                          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Nenhum código gerado ainda</p>
                        ):(
                          invites.map((invite) => (
                            <div className='invites-table-content' key={invite.id}>
                              <div className='invites-table-content-code'>{invite.code}</div>
                              <div className='invites-table-content-status'>
                                <span className={invite.isUsed ? 'status-utilizado' : 'status-disponivel'}> 
                                  {invite.isUsed ? 'UTILIZADO' : 'DISPONÍVEL'}
                                </span>
                              </div>
                              <div className='invites-table-content-actions'>
                                <button onClick={() => handleDeleteCode(invite.id)}>EXCLUIR</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )
            )}

            {/* MODAL DE CÓDIGO GERADO */}
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

            {/* RESTANTE DAS ABAS */}
            {noticias && <GestaoNoticias />}
            {eventos && <GestaoEventos />}
            {revistasEbooks && <p>Gestão de Revistas/Ebooks - Em construção...</p>}
            {documentosPublicos && <p>Gestão de Documentos Públicos - Em construção...</p>}
            {blog && <GestaoBlogAdmin/>}
          </>
        </section>
      </div>
      }
    </>
  );
}