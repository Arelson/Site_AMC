import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import './Articles.css'; 

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Artigo() {
    const { id } = useParams();
    const [artigo, setArtigo] = useState(null);
    const [erro, setErro] = useState(false);

    useEffect(() => {
    const carregarArtigo = async () => {
        try {
        const response = await fetch(`${apiURL}/api/article/${id}`);

        if (response.ok) {
            const data = await response.json();
            setArtigo(data);
        } else {
            setErro(true);
        }
        } catch (error) {
        console.error('Erro ao carregar artigo', error);
        setErro(true);
        }
    };
        carregarArtigo();
    }, [id]);

    if (erro) return <div className='loading'>Artigo não encontrado.</div>;
    if (!artigo) return <div className='loading'>Carregando artigo acadêmico...</div>;

    // Monta as URLs completas para a capa e para o PDF (já que o backend salva apenas o caminho relativo)
    const urlCapa = artigo.coverImage ? `${apiURL}${artigo.coverImage}` : null;
    const urlPdf = `${apiURL}${artigo.pdfUrl}`;

    return (
        <div className='leitura-container'>
            <Link to="/post" className="btn-voltar"> {/* Ajuste para a rota pública de artigos */}
                ← Voltar para a Biblioteca
            </Link>

            <article className='post-artigo'>
                
                {/* Capa Gerada Automaticamente pelo pdf2pic */}
                {urlCapa && (
            <div className='post-capa'>
                <img src={urlCapa} alt="Capa do Artigo" style={{ objectFit: 'contain', backgroundColor: '#f1f5f9' }}/>
            </div>
            )}

            <header className="post-header">
            {/* Palavras-Chave (Keywords) renderizadas como Tags */}
            <div className="tags-header-container">
                {artigo.keywords && artigo.keywords.split(',').map((palavra, index) => {
                const palavraLimpa = palavra.trim(); 
                if (!palavraLimpa) return null; 

                return (
                    <span key={index} className="categoria-tag-azul">
                    #{palavraLimpa}
                    </span>
                );
                })}
            </div>
            <h1>{artigo.title}</h1>

            {/* Box do Autor */}
            <div className="autor-info-box">
                <div className="autor-avatar">
                {artigo.author?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="autor-detalhes">
                <strong>Dr(a). {artigo.author?.name || 'Autor Desconhecido'}</strong>
                <span>
                    {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'}).toUpperCase()}
                    {' • '}
                    ARTIGO CIENTÍFICO
                </span>
                </div>
            </div>
            </header>

            <div className="post-conteudo-html">
            {/* Box Destacado para o Resumo (Abstract) */}
            <div style={{
                backgroundColor: '#f8fafc', 
                padding: '24px', 
                borderRadius: '8px', 
                marginBottom: '40px', 
                borderLeft: '5px solid #0056b3'
            }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.2rem', marginBottom: '12px' }}>Resumo</h3>
                <p style={{ lineHeight: '1.8', color: '#334155', margin: 0, fontSize: '1.05rem', textAlign: 'justify' }}>
                {artigo.abstract}
                </p>
            </div>

            {/* Leitor de PDF Embutido Nativo */}
            <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>Documento Completo</h3>
            <div className="pdf-viewer-container">
                <iframe className="pdf-iframe"
                    src={`${urlPdf}#view=FitH`}                                                         
                    width="100%" 
                    height="100%" 
                    title="Visualizador do Artigo"
                    allowFullScreen
                    />
            </div>

            </div>

            <footer className="post-footer">
            <div className="tags-container">
                {artigo.keywords && artigo.keywords.split(',').map((palavra, index) => {
                const palavraLimpa = palavra.trim(); 
                if (!palavraLimpa) return null; 

                return (
                    <span key={index} className="tag-item">
                    #{palavraLimpa}
                    </span>
                );
                })}
            </div>
            </footer>
        </article>
    </div>
    );
}