import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import './Post.css';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import hljs from 'highlight.js';
// Tema escuro e moderno para o código:
import 'highlight.js/styles/atom-one-dark.css'; 

const calcularTempoLeitura = (conteudoHtml) => {
  if (!conteudoHtml) return 1; 
  const textoPuro = conteudoHtml.replace(/<[^>]+>/g, '');
  const palavras = textoPuro.trim().split(/\s+/);
  const quantidadePalavras = palavras.filter(palavra => palavra.length > 0).length;
  const palavrasPorMinuto = 200;
  const tempoLeitura = Math.ceil(quantidadePalavras / palavrasPorMinuto);
  return tempoLeitura > 0 ? tempoLeitura : 1;
};

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [erro, setErro] = useState(false);
  const [conteudoFormatado, setConteudoFormatado] = useState('');

  useEffect(() => {
    const carregarPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${id}`);

        if (response.ok) {
          const data = await response.json();
          setPost(data);
          
          // Tratamento infalível para as fórmulas matemáticas
          const htmlComMatematica = data.content.replace(/\$\$(.*?)\$\$/g, '<span class="math-tex" data-math="$1"></span>');
          setConteudoFormatado(htmlComMatematica);

        } else {
          setErro(true);
        }
      } catch (error) {
        console.error('Erro ao carregar post', error);
        setErro(true);
      }
    };
    carregarPost();
  }, [id]);

  useEffect(() => {
    if (conteudoFormatado) {
      // 1. Processar Blocos de Código
      if (window.hljs) {
        const blocosDeCodigo = document.querySelectorAll('.post-conteudo-html pre code');
        blocosDeCodigo.forEach((bloco) => {
          // Limpa o estado anterior para não bugar as cores
          delete bloco.dataset.highlighted; 
          window.hljs.highlightElement(bloco);
        });
      }

      // 2. Processar Fórmulas Matemáticas
      if (katex) {
        setTimeout(() => {
          const formulas = document.querySelectorAll('.math-tex, math-inline, math-display');
          
          formulas.forEach((formulaEl) => {
            let equacao = formulaEl.getAttribute('data-math') || formulaEl.textContent;
    
            if (equacao) {
              equacao = equacao.replace(/\$\$/g, '').trim(); 
              
              try {
                katex.render(equacao, formulaEl, {
                  throwOnError: false,
                  displayMode: true 
                });
              } catch (error) {
                console.error('Erro ao renderizar equação', error);
              }
            }
          });    
        }, 100); 
      }
    }
  }, [conteudoFormatado]);

  if (erro) return <div className='loading'>Postagem não encontrada.</div>;
  if (!post) return <div className='loading'>Carregando postagem...</div>;

  return (
    <div className='leitura-container'>
      <Link to="/" className="btn-voltar">
        ← Voltar para a Home
      </Link>

      <article className='post-artigo'>
        {post.banner && (
          <div className='post-capa'>
            <img src={post.banner} alt="Banner da postagem"/>
          </div>
        )}

        <header className="post-header">
          <div className="tags-header-container">
            {post.keywords && post.keywords.split(',').map((palavra, index) => {
              const palavraLimpa = palavra.trim(); 
              if (!palavraLimpa) return null; 

              return (
                <span key={index} className="categoria-tag-azul">
                  #{palavraLimpa}
                </span>
              );
            })}
          </div>
          <h1>{post.title}</h1>

          <div className="autor-info-box">
            <div className="autor-avatar">
              {post.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="autor-detalhes">
              <strong>{post.author?.name}</strong>
              <span>
                {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'}).toUpperCase()}
                {' • '}
                {calcularTempoLeitura(post.content)} MIN DE LEITURA
              </span>
            </div>
          </div>
        </header>

        <div 
          className="post-conteudo-html"
          dangerouslySetInnerHTML={{ __html: conteudoFormatado }}
        />

        <footer className="post-footer">
          <div className="tags-container">
            {post.keywords && post.keywords.split(',').map((palavra, index) => {
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
  )
}