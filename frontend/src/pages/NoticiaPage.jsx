import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import renderMathInElement from 'katex/contrib/auto-render'; // Importa o auto-renderizador de matemática
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import 'katex/dist/katex.min.css'; // Importa os estilos visuais das equações
import './NoticiaPage.css';

export default function NoticiaPage() {
  const { id } = useParams(); 
  
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Referência para monitorar a div que contém o texto da notícia
  const conteudoRef = useRef(null);

  useEffect(() => {
    const buscarNoticia = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/news/${id}`);
        if (response.ok) {
          const dados = await response.json();
          setNoticia(dados);
        } else {
          setErro('Notícia não encontrada.');
        }
      } catch (error) {
        console.error('Erro ao carregar a notícia:', error);
        setErro('Ocorreu um erro ao carregar a página.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarNoticia();
    }
  }, [id]);

  // Efeito colateral focado em renderizar as equações matemáticas sempre que a notícia carregar
  useEffect(() => {
    if (noticia && conteudoRef.current) {
      renderMathInElement(conteudoRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true }, // Equações centralizadas em bloco próprio
          { left: '$', right: '$', display: false },   // Equações na mesma linha do texto (inline)
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false // Evita que a página quebre se houver um erro de digitação no LaTeX
      });
    }
  }, [noticia]);

  if (loading) {
    return <div className="noticia-loading">Carregando notícia...</div>;
  }

  if (erro || !noticia) {
    return <div className="noticia-erro">{erro}</div>;
  }

  const tagsArray = noticia.keywords 
    ? noticia.keywords.split(',').map(tag => tag.trim()) 
    : [];

  const dataFormatada = new Date(noticia.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  let nomeAutor = 'Administração AMC';
  if (noticia.author) {
    if (typeof noticia.author === 'string') {
      nomeAutor = noticia.author;
    } else if (typeof noticia.author === 'object') {
      nomeAutor = noticia.author.nome || noticia.author.name || 'Administração AMC';
    }
  }

  const inicialAutor = nomeAutor && typeof nomeAutor === 'string' 
    ? nomeAutor.charAt(0).toUpperCase() 
    : 'A';

  return (
    <>
      <Header 
        botaoAmarelo={false}
        backgroundScroll={false}   
      />
      <main className="pagina-noticia-container">
        
        {/* Banner Principal */}
        {noticia.banner && (
          <img src={noticia.banner} alt="Capa da notícia" className="noticia-banner" />
        )}

        {/* Tags / Palavras Chave */}
        {tagsArray.length > 0 && (
          <div className="noticia-tags">
            {noticia.category && (
              <span className="tag-item">#{noticia.category}</span>
            )}
            {tagsArray.map((tag, index) => (
              <span key={index} className="tag-item">#{tag}</span>
            ))}
          </div>
        )}

        {/* Título */}
        <h1 className="noticia-titulo">{noticia.title}</h1>

        {/* Informações do Autor e Data */}
        <div className="noticia-autor-area">
          <div className="autor-avatar">{inicialAutor}</div>
          <div className="autor-infos">
            <span className="autor-nome">{nomeAutor}</span>
            <span className="autor-data">{dataFormatada} - Leitura Rápida</span>
          </div>
        </div>

        {/* Corpo da Notícia (Com a Ref do KaTeX adicionada aqui) */}
        <div 
          ref={conteudoRef}
          className="noticia-conteudo-html"
          dangerouslySetInnerHTML={{ __html: noticia.content }} 
        />
        
      </main>
      <Footer />
    </>
  );
}