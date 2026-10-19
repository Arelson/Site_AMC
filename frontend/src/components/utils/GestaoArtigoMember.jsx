import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './GestaoBlogMember.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GestaoArtigosMember({ handleCriarArtigo = () => { }, handleEditarArtigo = () => { } }) {
    const [artigos, setArtigos] = useState([]);

    const handleExcluirArtigo = async (id) => {
        const confimar = window.confirm('Deseja exluir o artigo?');

        if (!confimar) return;

        try {
            const response = await fetch(`${apiURL}/api/article/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setArtigos(artigos.filter(artigo => artigo.id !== id));
                alert('Artigo excluido');
            } else {
                alert('Erro ao excluir artigo');
            }
        } catch (e) {
            console.error('Error: ', e);
        }
        
    };

    useEffect(() => {
        const buscarMeusArtigos = async () => {
            try {
                const response = await fetch(`${apiURL}/api/article/reader`, {
                    cache: 'no-store',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setArtigos(data);
                    } else if (data && Array.isArray(data.artigos)) {
                        setArtigos(data.artigos);
                    } else if (data && Array.isArray(data.data)) {
                        setArtigos(data.data);
                    } else {
                        setArtigos([]); // Se não achar a lista em nenhum lugar, fica vazio
                    }
                    console.log('datas encontradas:', data);
                } else {
                    console.error('Erro ao buscar artigos:', response.status)
                }
            } catch (e) {
                console.error('Error: ', e);
            }
        };
        buscarMeusArtigos();
    }, []);

    return (
        <div className="gestao-conteudo-content">
            <div className="gestao-conteudo-content-addvlog">
                <h2>GESTÃO DE ARTIGOS CIENTÍFICOS</h2>
                <a href="#" onClick={(e) => { e.preventDefault(); handleCriarArtigo(); }}>
                    <span>+</span> Novo Artigo
                </a>
            </div>
            
            <div className="gestao-conteudo-content-posts">
                <div className="tabela-header">
                    <span>Título do Artigo</span>
                    <span>Data</span>
                    <span>Status</span>
                    <span className="acao-header">Ações</span>
                </div>
                {artigos.length === 0 ? (
                    <div style={{padding:'20px', textAlign: 'center', color: '#888', fontSize: '20px'}}>
                        Nenhum artigo encontrado
                    </div>
                ) : (
                        artigos.map((artigo) => ( 
                            <div className="tabela-linha" key={artigo.id}>
                                <div className="col-info">
                                    <Link
                                        to={`/article/${artigo.id}`}
                                        target="_blank"
                                        className="post-titulo"
                                        style={{textDecoration:'none', color:'inherit'}}
                                    >
                                        {artigo.title}
                                    </Link>
                                </div>
                                <div className="col-data">
                                    {new Date(artigo.createdAt).toLocaleDateString('pt-BR')}
                                </div>

                                <div>
                                    <span className="badge-publicado"> Publicado </span>
                                </div>

                                <div className="col-acoes">
                                    <button
                                        className="btn-icone btn-editar"
                                        title="Editar"
                                        onClick={() => handleEditarArtigo(artigo.id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#e07272"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
            </div>
        
        </div>
    )
}
