import './CriarPost.css';
import React, { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import 'katex/dist/katex.min.css';
import katex from 'katex';

window.katex = katex;

const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

const Font = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace', 'roboto'];
Quill.register(Font, true);


export default function CriarPost({ voltarParaLista }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [banner, setBanner] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');

  const modules = {
    toolbar: [
      [{ 'font': Font.whitelist }],
      [{ 'size': Size.whitelist }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'formula'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleSalvar = async () => {
    const payload = {
      titulo,
      corpo: conteudo,
      banner,
      palavrasChave,
      data: new Date().toISOString()
    };
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/posts/register', {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }); 
      if (response.ok) {
        voltarParaLista({ preventDefault: () => {} });
      }
      else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro na conexão com o servidor');
    }
  }


  return (
    <div className = 'postagem-container'>
      <main className = 'conteudo-principal'>
        <header className = 'header-postagem'>
          <h1>Nova Postagem de Vlog</h1>
          <button className = 'btn-publicar' onClick={handleSalvar}>
            Publicar Post
          </button>
        </header>

        <div className='card-editor'>
          <input
            type="text"
            className="input-titulo"
            placeholder="Digite o título aqui ..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)} 
          />

          <div className='opcoes-extras'>
            <input
              type="text"
              className="input-extra"
              placeholder="Cole a URL da Imagem de Capa (Banner)..."
              value={banner}
              onChange={(e) => setBanner(e.target.value)} 
            />
            <input
              type="text"
              className="input-extra"
              placeholder="Palavras Chave (Separadas por vírgula)..."
              value={palavrasChave}
              onChange={(e) => setPalavrasChave(e.target.value)} 
            />
          </div>

          <ReactQuill
            theme="snow"
            modules={modules}
            value={conteudo}
            onChange={setConteudo}
            placeholder='Escreva o conteúdo da sua postagem...'
          />
        </div>
      </main>
    </div>
  );
};