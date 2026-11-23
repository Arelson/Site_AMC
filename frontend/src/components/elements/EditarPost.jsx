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

// --- COMPONENTE DA BARRA DE FERRAMENTAS ---
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

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- COMPONENTE PRINCIPAL ---
export default function EditarPost({ postId, voltarParaLista }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  
  // Estados para gerir os ficheiros físicos e URLs existentes
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [pdfExistente, setPdfExistente] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const bannerInputRef = useRef(null);
  const pdfInputRef = useRef(null);

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
    content: '',
    onUpdate: ({ editor }) => {
      setConteudo(editor.getHTML());
    },
  });

  // Busca os dados do banco
  useEffect(() => {
    const buscarDadosDoPost = async () => {
      if (!postId) return;

      try {
        const response = await fetch(`${apiURL}/api/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          const post = await response.json();
          setTitulo(post.title);
          setConteudo(post.content);
          setPalavrasChave(post.keywords || '');
          
          setBannerUrl(post.banner || '');
          setPdfExistente(post.pdf || ''); 

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
  }, [postId, voltarParaLista, editor]);

  // Funções de manipulação de upload
  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerUrl(''); // Limpa a URL se anexar um ficheiro
    }
  };

  const handleBannerUrlChange = (e) => {
    setBannerUrl(e.target.value);
    if (bannerFile) setBannerFile(null);
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleAtualizar = async () => {
    if (!titulo || conteudo === '' || conteudo === '<p></p>') {
      alert("O título e o conteúdo são obrigatórios.");
      return;
    }

    // Usar FormData para permitir envio de arquivos
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('corpo', conteudo);
    formData.append('palavrasChave', palavrasChave);

    if (bannerFile) {
      formData.append('banner', bannerFile);
    } else if (bannerUrl) {
      formData.append('bannerUrl', bannerUrl);
    }

    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiURL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Omitir o Content-Type para o FormData funcionar
        },
        body: formData
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
          <h1>Editar Postagem do Blog</h1>
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

          {/* ÁREA DA IMAGEM DE CAPA */}
          <div className='opcoes-extras banner-area'>
            <input
              type="text"
              className="input-extra"
              placeholder="URL da Imagem de Capa (Banner)..."
              value={bannerUrl}
              onChange={handleBannerUrlChange} 
              disabled={!!bannerFile}
            />
            <button className="btn-upload-banner" onClick={() => bannerInputRef.current.click()}>
              <Upload size={18} /> {bannerFile ? bannerFile.name : 'Substituir Imagem'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* ÁREA DO PDF (NOVA) */}
          <div className='opcoes-extras banner-area' style={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span className="input-extra" style={{ display: 'flex', alignItems: 'center', color: '#4b5563', border: 'none', background: 'transparent' }}>
               {pdfFile ? `Novo PDF: ${pdfFile.name}` : pdfExistente ? `PDF Atual: ${pdfExistente.split('/').pop()}` : 'Nenhum PDF anexado.'}
            </span>
            <button className="btn-upload-banner" style={{ backgroundColor: '#dc2626' }} onClick={() => pdfInputRef.current.click()}>
              <Upload size={18} /> {pdfExistente ? 'Substituir PDF' : 'Anexar Novo PDF'}
            </button>
            <input 
              type="file" 
              accept="application/pdf" 
              ref={pdfInputRef} 
              onChange={handlePdfUpload} 
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