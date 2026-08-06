import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import { User, CreditCard, FileDigit, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EventoForms() {
  const { id } = useParams(); // Pega o ID do evento na URL
  const navigate = useNavigate();

  // Estados para o formulário
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    email: '',
    telefone: ''
  });
  
  const [enviando, setEnviando] = useState(false);

  // Atualiza os dados conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função disparada ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      // Futuramente, você substituirá este bloco por um fetch() (POST) para o seu backend
      console.log("Dados enviados para o evento", id, ":", formData);
      
      // Simulando um tempo de carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Inscrição realizada com sucesso! Você receberá a confirmação por e-mail.');
      
      // Redireciona de volta para a página do evento
      navigate(`/evento/${id}`);
      
    } catch (error) {
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header botaoAmarelo={false} backgroundScroll={false} />
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '600px' }}>
          
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}
          >
            <ArrowLeft size={16} /> Voltar para o evento
          </button>

          <h2 style={{ marginBottom: '8px', color: '#1e293b', fontSize: '24px' }}>Formulário de Inscrição</h2>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
            Preencha seus dados abaixo para garantir sua vaga neste evento.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Campo: Nome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Nome Completo *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', backgroundColor: '#f8fafc' }}>
                <User size={18} color="#94a3b8" />
                <input 
                  type="text" name="nome" required
                  value={formData.nome} onChange={handleChange}
                  placeholder="Ex: João da Silva"
                  style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            {/* Grid para CPF e Matrícula */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>CPF *</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', backgroundColor: '#f8fafc' }}>
                  <CreditCard size={18} color="#94a3b8" />
                  <input 
                    type="text" name="cpf" required
                    value={formData.cpf} onChange={handleChange}
                    placeholder="000.000.000-00"
                    style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Matrícula</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', backgroundColor: '#f8fafc' }}>
                  <FileDigit size={18} color="#94a3b8" />
                  <input 
                    type="text" name="matricula"
                    value={formData.matricula} onChange={handleChange}
                    placeholder="Sua matrícula"
                    style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Campo: E-mail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>E-mail *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', backgroundColor: '#f8fafc' }}>
                <Mail size={18} color="#94a3b8" />
                <input 
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="exemplo@email.com"
                  style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            {/* Campo: Telefone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Telefone/WhatsApp *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', backgroundColor: '#f8fafc' }}>
                <Phone size={18} color="#94a3b8" />
                <input 
                  type="tel" name="telefone" required
                  value={formData.telefone} onChange={handleChange}
                  placeholder="(00) 90000-0000"
                  style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <button 
              type="submit" 
              disabled={enviando}
              style={{ 
                marginTop: '16px', padding: '16px', fontSize: '16px', fontWeight: 'bold', 
                backgroundColor: enviando ? '#94a3b8' : '#2563eb', color: '#ffffff', 
                border: 'none', borderRadius: '8px', cursor: enviando ? 'not-allowed' : 'pointer', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              {enviando ? 'Processando...' : <><CheckCircle size={20} /> Confirmar Inscrição</>}
            </button>

          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
