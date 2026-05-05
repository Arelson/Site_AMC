import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import './Post.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';


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

  useEffect(() => {
    const carregarPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${id}`);

        if (response.ok) {
          const data = await response.json();
          setPost(data);
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
    // Isso força o KaTeX a procurar fórmulas que o Quill salvou
    window.katex = katex;
  }, []);

  useEffect(() => {
    if (post) {
      if (window.hljs) {
        const blocosDeCodigo = document.querySelectorAll('.post-conteudo-html pre');
  
        blocosDeCodigo.forEach((bloco) => {
          if (bloco.getAttribute('data-language') === 'plain') {
            bloco.removeAttribute('data-language');
          }
          bloco.classList.add('hljs');
          window.hljs.highlightElement(bloco);
        });
      }

      if (katex) {
        setTimeout(() => {
          const formulas = document.querySelectorAll('.post-conteudo-html .ql-formula');
          formulas.forEach((formulaEl) => {
            let equacao = formulaEl.getAttribute('data-value') || formulaEl.textContent;
    
            if (equacao) {
              equacao = equacao.replace(/\uFEFF/g, '').trim();
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
  }, [post]);

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
              // O .trim() remove espaços em branco acidentais, ex: " palavra2 " vira "palavra2"
              const palavraLimpa = palavra.trim(); 
              
              // Se a pessoa digitou uma vírgula a mais no final, isso evita criar um quadrado vazio
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
              {post.author?.name.charAt(0).toUpperCase()}
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
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="post-footer">
          <div className="tags-container">
            {post.keywords && post.keywords.split(',').map((palavra, index) => {
              // O .trim() remove espaços em branco acidentais, ex: " palavra2 " vira "palavra2"
              const palavraLimpa = palavra.trim(); 
              
              // Se a pessoa digitou uma vírgula a mais no final, isso evita criar um quadrado vazio
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