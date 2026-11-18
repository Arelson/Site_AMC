// src/pages/EditarNoticia.jsx
import React, { useState, useEffect, useRef } from 'react';
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

import { 
  Upload, ArrowLeft, Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Quote, Code, Sigma, Link as LinkIcon, Video, Image as ImageIcon 
} from 'lucide-react';

import './EditarNoticia.css'; 

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="tiptap-toolbar">
      <div className="toolbar-group">
        <select className="toolbar-select" onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>
          <option value="Inter">Fonte Padrão</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
        <select className="toolbar-select" onChange={(e) => editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) }).run()}>
          <option value="0">Texto Normal</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>
      </div>

      <div className="toolbar-group">
        <button className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={18} /></button>
        <button className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={18} /></button>
        <button className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={18} /></button>
      </div>

      <div className="toolbar-group">
        <button className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={18} /></button>
        <button className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={18} /></button>
        <button className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={18} /></button>
        <button className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify size={18} /></button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></button>
        <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></button>
        <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={18} /></button>
        <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={18} /></button>
        <button className="toolbar-btn" onClick={() => editor.chain().focus().insertMath().run()}><Sigma size={18} /></button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => { const url = window.prompt('URL do link:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }}><LinkIcon size={18} /></button>
        <button className="toolbar-btn" onClick={() => { const url = window.prompt('URL do vídeo do YouTube:'); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); }}><Video size={18} /></button>
        <button className="toolbar-btn" onClick={() => { const url = window.prompt('URL da Imagem:'); if (url) editor.chain().focus().setImage({ src: url }).run(); }}><ImageIcon size={18} /></button>
      </div>
    </div>
  );
};

export default function EditarNoticia({ postId, voltarParaLista }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  const [categoria, setCategoria] = useState('CIÊNCIA');
  
  // Estados para gerir ficheiros físicos e URLs existentes
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  
  const [pdfExistente, setPdfExistente] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const bannerInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextStyle, FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }), Image,
      Youtube.configure({ width: 640, height: 480 }),
      MathExtension.configure({ evaluation: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => setConteudo(editor.getHTML()),
  });

  // Carregar os dados atuais da notícia
  useEffect(() => {
    const carregarNoticia = async () => {
      if (!postId || postId === "undefined") return;

      try {
        const response = await fetch(`${apiURL}/api/news/${postId}`);
        if (response.ok) {
          const post = await response.json();
          setTitulo(post.title || '');
          setConteudo(post.content || '');
          setPalavrasChave(post.keywords || '');
          setCategoria(post.category || 'CIÊNCIA');
          
          setBannerUrl(post.banner || '');
          setPdfExistente(post.pdf || ''); 
          
          if (editor) {
            editor.commands.setContent(post.content);
          } 
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    carregarNoticia();
  }, [postId, editor]);

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerUrl(''); // Limpa a URL se o utilizador escolher um ficheiro físico
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
    if (!titulo || !conteudo || conteudo === '<p></p>') {
      alert("Título e conteúdo são obrigatórios.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      const palavrasChaveFinais = palavrasChave.trim() 
      ? `${categoria}, ${palavrasChave.trim().toUpperCase()}`
      : categoria;
      
      formData.append('titulo', titulo);
      formData.append('corpo', conteudo);
      formData.append('PalavrasChave', palavrasChaveFinais);

      // Gestão do Banner: Envia o ficheiro físico ou a URL atual/editada
      if (bannerFile) {
        formData.append('banner', bannerFile);
      } else if (bannerUrl) {
        formData.append('bannerUrl', bannerUrl); 
      }

      // Gestão do PDF
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const response = await fetch(`${apiURL}/api/news/${postId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // ⚠️ ATENÇÃO: Nunca defina 'Content-Type' manualmente ao usar FormData!
          // O navegador calcula o "boundary" do multipart automaticamente.
        },
        body: formData 
      });

      console.log(formData);

      if (response.ok) {
        alert('Notícia atualizada com sucesso!');
        voltarParaLista();
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao atualizar a notícia.');
    }
  };

  return (
    <div className="editar-noticia-container">
      <header className="editar-header">
        <button className="btn-voltar" onClick={voltarParaLista}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1>Editar Notícia AMC</h1>
        <button className="btn-atualizar" onClick={handleAtualizar}>
          Atualizar Notícia
        </button>
      </header>

      <div className="card-editor">
        
        <input 
          type="text" 
          className="input-titulo-gigante"
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          placeholder="Digite o título da notícia..." 
        />
        
        {/* ÁREA DA IMAGEM DE CAPA */}
        <div className="banner-area">
          <input 
            type="text" 
            className="input-form"
            value={bannerUrl} 
            onChange={handleBannerUrlChange} 
            placeholder="Cole a URL da Imagem de Capa (Banner)..." 
            disabled={!!bannerFile}
          />
          <button className="btn-upload" onClick={() => bannerInputRef.current.click()}>
            <Upload size={16} /> {bannerFile ? bannerFile.name : 'Substituir Imagem'}
          </button>
          <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerUpload} style={{ display: 'none' }} />
        </div>

        {/* ÁREA DO PDF (NOVA) */}
        <div className="banner-area" style={{ marginTop: '10px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
          <span className="label-form" style={{ display: 'flex', alignItems: 'center', flex: 1, color: '#4b5563', marginBottom: 0 }}>
             {pdfFile ? `Novo PDF: ${pdfFile.name}` : pdfExistente ? `PDF Atual: ${pdfExistente.split('/').pop()}` : 'Nenhum PDF anexado.'}
          </span>
          <button className="btn-upload" style={{ backgroundColor: '#dc2626' }} onClick={() => pdfInputRef.current.click()}>
            <Upload size={16} /> {pdfExistente ? 'Substituir PDF' : 'Anexar Novo PDF'}
          </button>
          <input type="file" accept="application/pdf" ref={pdfInputRef} onChange={handlePdfUpload} style={{ display: 'none' }} />
        </div>

        <div className="categoria-tags-area">
          <div className="form-group-cat">
            <label className="label-form">CATEGORIA PRINCIPAL</label>
            <select className="select-form" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="CIÊNCIA">CIÊNCIA</option>
              <option value="EVENTOS">EVENTOS</option>
              <option value="ACADEMIA">ACADEMIA</option>
              <option value="PARCERIAS">PARCERIAS</option>
              <option value="EDITAIS">EDITAIS</option>
            </select>
          </div>
          <div className="form-group-tags">
            <label className="label-form">TAGS COMPLEMENTARES (SEPARADAS POR VÍRGULA)</label>
            <input 
              type="text" 
              className="input-form"
              value={palavrasChave} 
              onChange={(e) => setPalavrasChave(e.target.value)} 
              placeholder="Ex: INOVAÇÃO, TECNOLOGIA, UFMA" 
            />
          </div>
        </div>
        
        <div className="tiptap-wrapper">
          <MenuBar editor={editor} />
          <div className="tiptap-content-area">
             <EditorContent editor={editor} />
          </div>
        </div>

      </div>
    </div>
  );
}