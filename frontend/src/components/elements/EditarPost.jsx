import './CriarPost.css';
import React, { useState, useEffect, useRef } from 'react';

// Core do Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Youtube } from '@tiptap/extension-youtube';
import MathExtension from '@aarkue/tiptap-math-extension';

// Ícones
import { 
  Bold, Italic, Underline as UnderlineIcon, Quote, Code, 
  List, ListOrdered, IndentIncrease, IndentDecrease, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Link as LinkIcon, Video, Image as ImageIcon, Upload, Sigma 
} from 'lucide-react';

import 'katex/dist/katex.min.css';

// --- COMPONENTE DA BARRA DE FERRAMENTAS (Igual ao CriarPost) ---
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL do link:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addVideo = () => {
    const url = window.prompt('URL do vídeo do YouTube:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const addImageURL = () => {
    const url = window.prompt('URL da Imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <select 
          className="toolbar-select"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || ''}
        >
          <option value="">Fonte Padrão (Sem Serifa)</option>
          <option value="Georgia, serif">Com Serifa</option>
          <option value="monospace">Monospace</option>
        </select>

        <select 
          className="toolbar-select"
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
          }}
        >
          <option value="p">Texto Normal</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Negrito"><Bold size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Itálico"><Italic size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''} title="Sublinhado"><UnderlineIcon size={18} /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={18} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={18} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={18} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}><AlignJustify size={18} /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Lista Pontos"><List size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Lista Numérica"><ListOrdered size={18} /></button>
        <button onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Aumentar Recuo (Listas)"><IndentIncrease size={18} /></button>
        <button onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Diminuir Recuo (Listas)"><IndentDecrease size={18} /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} title="Citação"><Quote size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} title="Bloco de Código"><Code size={18} /></button>
        <button onClick={() => editor.chain().focus().insertContent('$$ $$').run()} title="Fórmula Matemática"><Sigma size={18} /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button onClick={addLink} className={editor.isActive('link') ? 'is-active' : ''} title="Inserir Link"><LinkIcon size={18} /></button>
        <button onClick={addVideo} title="Inserir Vídeo do Youtube"><Video size={18} /></button>
        <button onClick={addImageURL} title="Imagem por URL"><ImageIcon size={18} /></button>
        <label className="upload-btn" title="Upload de Imagem">
          <Upload size={18} />
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
export default function EditarPost({ postId, voltarParaLista }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [banner, setBanner] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  
  const bannerInputRef = useRef(null);

  // Inicializa o Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ width: 640, height: 480 }),
      MathExtension.configure({ evaluation: false }),
    ],
    content: '', // Inicia vazio
    onUpdate: ({ editor }) => {
      setConteudo(editor.getHTML());
    },
  });

  // Busca os dados do banco
  useEffect(() => {
    const buscarDadosDoPost = async () => {
      if (!postId) return;

      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          const post = await response.json();
          setTitulo(post.title);
          setConteudo(post.content);
          setBanner(post.banner || '');
          setPalavrasChave(post.keywords || '');

          // INJEÇÃO CRUCIAL: Atualiza o conteúdo do Tiptap após o fetch
          if (editor) {
            editor.commands.setContent(post.content);
          }

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
  }, [postId, voltarParaLista, editor]); // Refaz a injeção se o editor demorar para carregar

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBanner(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAtualizar = async () => {
    if (!titulo || conteudo === '' || conteudo === '<p></p>') {
      alert("O título e o conteúdo são obrigatórios.");
      return;
    }

    const payload = { titulo, corpo: conteudo, banner, palavrasChave };

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
    <div className='postagem-container'>
      <main className='conteudo-principal'>
        <header className='header-postagem'>
          <h1>Editar Postagem de Vlog</h1>
          <button className='btn-publicar' onClick={handleAtualizar}>
            Atualizar Post
          </button>
        </header>

        <div className='card-editor'>
          <input
            type='text'
            className='input-titulo'
            placeholder='Digite o título aqui ...'
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <div className='opcoes-extras banner-area'>
            <input
              type="text"
              className="input-extra"
              placeholder="URL da Imagem de Capa (Banner)..."
              value={banner}
              onChange={(e) => setBanner(e.target.value)} 
            />
            <button className="btn-upload-banner" onClick={() => bannerInputRef.current.click()}>
              <Upload size={18} /> Upload Banner
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              style={{ display: 'none' }} 
            />
          </div>

          <div className='opcoes-extras'>
            <input
              type="text"
              className="input-extra"
              placeholder="Palavras Chave (Separadas por vírgula)..."
              value={palavrasChave}
              onChange={(e) => setPalavrasChave(e.target.value)} 
            />
          </div>

          <div className="tiptap-wrapper">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="tiptap-editor-area" />
          </div>
        </div>
      </main>
    </div>
  );
}