import React, { useState, useRef, useEffect } from 'react';
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
import './EditarNoticia'; 

// MenuBar (Idêntico ao do CriarEvento)
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

// ATENÇÃO: Recebemos o eventoId como propriedade para saber qual editar!
export default function EditarEvento({ eventoId, voltarParaLista }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [banner, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const bannerInputRef = useRef(null);

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

  // BUSCAR OS DADOS INICIAIS DO EVENTO
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${eventoId}`);
        if (response.ok) {
          const data = await response.json();
          
          setTitle(data.title);
          setLocation(data.location);
          setBannerUrl(data.banner || '');
          setDescription(data.description || '');

          // Ajuste da data: O input datetime-local precisa do formato YYYY-MM-DDTHH:mm
          if (data.date) {
            const formattedDate = new Date(data.date).toISOString().slice(0, 16);
            setDate(formattedDate);
          }

          // Preenche o editor Tiptap com a descrição salva
          if (editor && data.description) {
            editor.commands.setContent(data.description);
          }
        } else {
          alert("Erro ao buscar dados do evento.");
          voltarParaLista();
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) {
      fetchEvento();
    }
  }, [eventoId, editor]); // Roda quando o ID ou o editor estiverem prontos

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAtualizarEvento = async () => {
    if (!title.trim() || !date || !location.trim()) {
      alert("Por favor, preencha os campos obrigatórios: Título, Data e Local.");
      return;
    }

    const payload = {
      title,
      banner,
      description,
      date,
      location
    };

    try {
      const token = localStorage.getItem('token');
      // USAMOS O MÉTODO PUT E ENVIAMOS O ID NA URL!
      const response = await fetch(`http://localhost:3000/api/events/${eventoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }); 

      if (response.ok) {
        alert('Evento atualizado com sucesso!');
        voltarParaLista();
      } else {
        const err = await response.json();
        alert(`Erro ao atualizar: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao tentar se conectar com o servidor.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados do evento...</div>;
  }

  return (
    <div className='postagem-container'>
      <main className='conteudo-principal'>
        <header className='header-postagem'>
          <div className="header-esquerda">
            <button className="btn-voltar-seta" onClick={voltarParaLista}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h1>Editar Evento</h1>
          </div>
          <button className='btn-publicar' onClick={handleAtualizarEvento}>Salvar Alterações</button>
        </header>

        <div className='card-editor'>
          <input 
            type="text" 
            className="input-titulo" 
            placeholder="Digite o título do evento..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
          />

          <div className='opcoes-extras banner-area'>
            <input 
              type="text" 
              className="input-extra" 
              placeholder="Cole a URL do Banner do Evento..." 
              value={banner} 
              onChange={(e) => setBannerUrl(e.target.value)} 
            />
            <button type="button" className="btn-upload-banner" onClick={() => bannerInputRef.current.click()}>
              <Upload size={16} /> Trocar Imagem
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              style={{ display: 'none' }} 
            />
          </div>

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
