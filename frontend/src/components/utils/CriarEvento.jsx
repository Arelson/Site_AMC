import React, { useState, useRef } from 'react';
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
  Bold, Italic, Underline as UnderlineIcon, Quote, Code, List, 
  ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Link as LinkIcon, Video, Image as ImageIcon, Upload, Sigma, ArrowLeft 
} from 'lucide-react';
import 'katex/dist/katex.min.css';
// Supondo que você use o mesmo CSS da notícia ou tenha criado um CriarEvento.css semelhante
import './CriarNoticia.css'; 

// Componente Interno: Barra de Ferramentas do Editor Tiptap (Mesmo da Notícia)
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

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <select className="toolbar-select" onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>
          <option value="">Fonte Padrão</option>
          <option value="Georgia, serif">Serifada (Georgia)</option>
          <option value="monospace">Monospace</option>
        </select>
        <select className="toolbar-select" onChange={(e) => e.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) }).run()}>
          <option value="p">Texto Normal</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>
      </div>
      
      <div className="toolbar-divider" />
      
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><UnderlineIcon size={18} /></button>
      </div>
      
      <div className="toolbar-divider" />
      
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}><AlignJustify size={18} /></button>
      </div>
      
      <div className="toolbar-divider" />
      
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={18} /></button>
      </div>
      
      <div className="toolbar-divider" />
      
      <div className="toolbar-group">
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}><Code size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().insertContent('$$ $$').run()} title="Inserir Fórmula Matemática"><Sigma size={18} /></button>
      </div>
      
      <div className="toolbar-divider" />
      
      <div className="toolbar-group">
        <button type="button" onClick={addLink} className={editor.isActive('link') ? 'is-active' : ''}><LinkIcon size={18} /></button>
        <button type="button" onClick={addVideo}><Video size={18} /></button>
        <button type="button" onClick={addImageURL}><ImageIcon size={18} /></button>
      </div>
    </div>
  );
};

export default function CriarEvento({ voltarParaLista }) {
  // Estados para os campos do Evento baseados no schema do Prisma
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
//   const [capacity, setCapacity] = useState(0);
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');

  const bannerInputRef = useRef(null);

  // Instância do Tiptap para a Descrição do Evento
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextStyle, FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }), Image,
      Youtube.configure({ width: 640, height: 480 }),
      MathExtension.configure({ evaluation: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => setDescription(editor.getHTML()),
  });

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerUrl(e.target.result); // Converte para string Base64
      reader.readAsDataURL(file);
    }
  };

  const handlePublicarEvento = async () => {
    // Validação básica igual à do backend
    if (!title.trim() || !date || !location.trim()) {
      alert("Por favor, preencha os campos obrigatórios: Título, Data e Local.");
      return;
    }

    // O objeto deve ter as mesmas chaves que o Controller do backend espera no req.body
    const payload = {
      title,
      banner,
      description,
      date,
      location,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Mantenha se a rota estiver protegida
        },
        body: JSON.stringify(payload)
      }); 

      if (response.ok) {
        alert('Evento publicado com sucesso!');
        voltarParaLista();
      } else {
        const err = await response.json();
        alert(`Erro ao publicar: ${err.error || 'Verifique os dados enviados.'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao tentar se conectar com o servidor.');
    }
  };

  return (
    <div className='postagem-container'>
      <main className='conteudo-principal'>
        <header className='header-postagem'>
          <div className="header-esquerda">
            <button className="btn-voltar-seta" onClick={voltarParaLista}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h1>Novo Evento AMC</h1>
          </div>
          <button className='btn-publicar' onClick={handlePublicarEvento}>Publicar Evento</button>
        </header>

        <div className='card-editor'>
          {/* Título do Evento */}
          <input 
            type="text" 
            className="input-titulo" 
            placeholder="Digite o título do evento..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
          />

          {/* Upload e URL do Banner */}
          <div className='opcoes-extras banner-area'>
            <input 
              type="text" 
              className="input-extra" 
              placeholder="Cole a URL do Banner do Evento..." 
              value={banner} 
              onChange={(e) => setBannerUrl(e.target.value)} 
            />
            <button type="button" className="btn-upload-banner" onClick={() => bannerInputRef.current.click()}>
              <Upload size={16} /> Carregar Imagem
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Dados Específicos do Evento (Data, Local, Capacidade) */}
          <div className='opcoes-extras grid-inputs'>
            <div className="input-group-field">
              <label>Data e Hora *</label>
              <input 
                type="datetime-local" 
                className="input-extra" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group-field">
              <label>Local *</label>
              <input 
                type="text" 
                className="input-extra" 
                placeholder="Ex: Auditório Central" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required
              />
            </div>

          </div>

          {/* Área Dinâmica do Tiptap para a Descrição */}
          <div className="tiptap-wrapper">
            <h3 style={{ margin: '10px 15px', color: '#555', fontSize: '14px' }}>Descrição do Evento</h3>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="tiptap-editor-area" />
          </div>
        </div>
      </main>
    </div>
  );
}
