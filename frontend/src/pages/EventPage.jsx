import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import renderMathInElement from 'katex/contrib/auto-render';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import 'katex/dist/katex.min.css';
import './NoticiaPage.css'; // Podemos reaproveitar o CSS base da notícia

export default function EventoPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [inscrito, setInscrito] = useState(false);
  
  // Referência para monitorar a div que contém a descrição do evento (para o KaTeX)
  const conteudoRef = useRef(null);

  // Imagem padrão caso o evento não tenha
  const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  useEffect(() => {
    const buscarEvento = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${id}`);
        if (response.ok) {
          const dados = await response.json();
          setEvento(dados);
        } else {
          setErro('Evento não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar o evento:', error);
        setErro('Ocorreu um erro ao carregar a página do evento.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarEvento();
    }
  }, [id]);

  // Efeito para renderizar as equações matemáticas do Tiptap
  useEffect(() => {
    if (evento && conteudoRef.current) {
      renderMathInElement(conteudoRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false 
      });
    }
  }, [evento]);

  const handleInscricao = () => {
    // Aqui no futuro você fará um POST para o backend salvar a inscrição do usuário logado
    navigate(`/eventos/${id}/inscricao`);
    setInscrito(true);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header botaoAmarelo={false} backgroundScroll={false} />
        <div className="noticia-loading" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando detalhes do evento...</div>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header botaoAmarelo={false} backgroundScroll={false} />
        <div className="noticia-erro" style={{ flex: 1, textAlign: 'center', padding: '50px' }}>{erro}</div>
      </div>
    );
  }

  // Tratamento da Data e Hora
  const dataObjeto = new Date(evento.date);
  const dataFormatada = dataObjeto.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const horaFormatada = dataObjeto.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  });
  
  const jaPassou = dataObjeto < new Date();

  // Lógica da Imagem
  const urlDaImagem = evento.banner || evento.bannerUrl;
  const imagemParaExibir = (urlDaImagem && urlDaImagem.trim() !== "") ? urlDaImagem : DEFAULT_EVENT_IMAGE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header 
        botaoAmarelo={false}
        backgroundScroll={false}   
      />
      
      <main className="pagina-noticia-container" style={{ flex: 1, paddingBottom: '60px' }}>
        
        {/* Banner Principal do Evento */}
        <div style={{ position: 'relative', width: '100%', maxHeight: '450px', overflow: 'hidden', borderRadius: '12px', marginBottom: '24px', backgroundColor: '#e2e8f0' }}>
          <img 
            src={imagemParaExibir} 
            alt="Capa do Evento" 
            className="noticia-banner" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: jaPassou ? 'grayscale(70%)' : 'none'
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_EVENT_IMAGE; }}
          />
          {jaPassou && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#64748b', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              Evento Realizado
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="noticia-titulo" style={{ marginBottom: '24px', color: '#1e293b' }}>{evento.title}</h1>

        {/* Barra de Informações do Evento (Substitui o Autor) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          backgroundColor: '#fff', 
          padding: '24px', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
            <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Data</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{dataFormatada}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
            <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Horário</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{horaFormatada}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
            <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
              <MapPin size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Local</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{evento.location}</p>
            </div>
          </div>

        </div>

        {/* Corpo do Evento (Conteúdo HTML vindo do Tiptap) */}
        <div 
          ref={conteudoRef}
          className="noticia-conteudo-html"
          dangerouslySetInnerHTML={{ __html: evento.description || '<p>Sem descrição fornecida.</p>' }} 
        />

        {/* Call to Action (Botão de Inscrição) */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
          {jaPassou ? (
            <button disabled style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#cbd5e1', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
              Este evento já foi encerrado
            </button>
          ) : inscrito ? (
            <button disabled style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✓ Você já está inscrito
            </button>
          ) : (
            <button 
              onClick={handleInscricao}
              style={{ padding: '16px 40px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.06)', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Garantir Minha Vaga
            </button>
          )}
        </div>
        
      </main>
      <Footer />
    </div>
  );
}
