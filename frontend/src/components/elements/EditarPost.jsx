import './CriarPost.css';
import React, { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

const Font = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace', 'roboto'];
Quill.register(Font, true);

export default function EditarPost({ postId, voltarParaLista }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

  const modules = {
    toolbar: [
      [{ 'font': Font.whitelist }],
      [{ 'size': Size.whitelist }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  useEffect(() => {
    const buscarDadosDoPost = async () => {
      if (!postId) return;

      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const post = await response.json();
          setTitulo(post.title);
          setConteudo(post.content);
        } else {
          alert('Erro ao carregar o post para edição.');
          voltarParaLista({ preventDefault: () => {} });
        }
      } catch (error) {
        console.error('Erro ao buscar post: ', error);
        voltarParaLista({ preventDefault: () => {} });
      }
    };

    buscarDadosDoPost();
  }, [postId, voltarParaLista]);

  const handleAtualizar = async () => {
    const payload = {
      titulo,
      corpo: conteudo
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Postagem atualizada com sucesso!');
        voltarParaLista({ preventDefault: () => {} });
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert('Erro na conexão com o servidor');
    }
  };
  return (
    <div className ='postagem-container'>
      <main className = 'conteudo-principal'>
        <header className = 'header-postagem'>
          <h1>Editar Postagem de Vlog</h1>
          <button className='btn-publicar' onClick={handleAtualizar}>
            Atualizar Post
          </button>
        </header>

        <div className='card-editor'>
          <input
            type='text'
            className='input-titulo'
            placeholder = 'Digite o título aqui ...'
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <ReactQuill
            theme='snow'
            modules={modules}
            value={conteudo}
            onChange={setConteudo}
            placeholder='Digite o conteudo aqui ...' 
          />
        </div>
      </main>
    </div>
  )
}