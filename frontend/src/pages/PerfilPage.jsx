import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import './PerfilPage.css';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MembroPage() {
    const { id } = useParams(); // Pega o ID da URL (ex: /membro/5)
    const navigate = useNavigate();
    const [membro, setMembro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregarPerfil = async () => {
        try {
            const response = await fetch(`${apiURL}/api/auth/members/${id}`);
            
            if (response.ok) {
            const dados = await response.json();
            setMembro(dados);
            } else {
            setErro('Membro não encontrado ou ocorreu um erro.');
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            setErro('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
        };
        carregarPerfil();
    }, [id]);

    if (loading) {
        return (
        <div className="perfil-loading-container">
            <Header botaoAmarelo={false} backgroundScroll={false} />
            <div className="perfil-mensagem">Carregando perfil...</div>
            <Footer />
        </div>
        );
    }

    if (erro || !membro) {
        return (
        <div className="perfil-erro-container">
            <Header botaoAmarelo={false} backgroundScroll={false} />
            <div className="perfil-mensagem erro">
            <h2>Oops!</h2>
            <p>{erro}</p>
            <button onClick={() => navigate('/equipe')} className="btn-voltar">
                Voltar para Equipe
            </button>
            </div>
            <Footer />
        </div>
        );
    }

    return (
        <div className="perfil-page-wrapper">
        <Header botaoAmarelo={false} backgroundScroll={false} />
        
        {/* Container principal (empurra o footer pra baixo) */}
        <main className="perfil-conteudo-principal">
            
            <article className="perfil-container">
            {/* Coluna Esquerda: Foto e Links */}
            <aside className="perfil-sidebar">
                <div className="perfil-foto-grande">
                {membro.fotoPerfil && membro.fotoPerfil !== 'default.png' ? (
                    <img src={`/uploads/${membro.fotoPerfil}`} alt={`Foto de ${membro.name}`} />
                ) : (
                    <div className="perfil-foto-placeholder">
                    {membro.name.charAt(0).toUpperCase()}
                    </div>
                )}
                </div>
                {membro.linkLattes && (
                <a 
                    href={membro.linkLattes} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-lattes-grande"
                >
                    Acessar Currículo Lattes
                </a>
                )}
            </aside>
            {/* Coluna Direita: Informações e Bio */}
            <section className="perfil-detalhes">
                <button onClick={() => navigate('/members')} className="btn-voltar-simples">
                ← Voltar para Equipe
                </button>
                
                <h1 className="perfil-nome">{membro.name}</h1>
                
                <div className="perfil-badges">
                {membro.cargo && <span className="badge-cargo">{membro.cargo}</span>}
                {membro.cadeiraOcupacao && <span className="badge-cadeira">{membro.cadeiraOcupacao}</span>}
                </div>
                <div className="perfil-bio-container">
                <h2>Biografia</h2>
                {membro.bio ? (
                    <p className="perfil-bio-texto">{membro.bio}</p>
                ) : (
                    <p className="perfil-bio-vazia">Este membro ainda não adicionou uma biografia.</p>
                )}
                </div>
            </section>
            </article>
            
            {membro.user?.posts && membro.user.posts.length > 0 && (
            <section className="membro-blog-section">
                <h2 className="membro-blog-section-titulo">Publicações Recentes</h2>
                
                <div className="membro-blog-grid">
                {membro.user.posts.map(post => (
                    <article key={post.id} className="membro-blog-card">
                    {post.banner && (
                        <img src={post.banner} alt="Capa" className="membro-blog-card-img" />
                    )}
                    <div className="membro-blog-card-conteudo">
                        <span className="membro-blog-card-data">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR', { 
                            day: '2-digit', month: 'long', year: 'numeric' 
                        })}
                        </span>
                        {/* Ajuste post.title para o nome exato da coluna do seu banco */}
                        <h3 className="membro-blog-card-titulo">{post.title}</h3>
                        
                        {/* Ajuste a URL do navigate para a rota real da sua página de leitura de blog/notícia */}
                        <button 
                            onClick={() => navigate(`/post/${post.id}`)} 
                            className="membro-blog-card-btn"
                        >
                            Ler publicação →
                        </button>
                    </div>
                    </article>
                ))}
                </div>
            </section>
            )}
        </main>
        <Footer />
        </div>
    );
}