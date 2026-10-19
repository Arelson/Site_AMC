import React, { useState, useRef} from "react";
import { Upload, FileText } from "lucide-react";
import './CriarPost.css';

export default function CriarArtigo({ voltarParalista }) {
    const [titulo, setTitulo] = useState('');
    const [abstract, setAbstract] = useState('');
    const [palavrasChave, setPalavrasChave] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const pdfInputRef = useRef(null);

    const handlePdfUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Por favor, selecione apenas arquivos .pdf');
                event.target.value = '';
                return;
            }

            setPdfFile(file);
        }
    }

    const handleSalvar = async () => {
        if (!titulo || !abstract || !pdfFile) {
            alert('O titulo, resumo (abstract) e o arquivo pdf são obrigatorios.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', titulo);
        formData.append('abstract', abstract);
        formData.append('keywords', palavrasChave);
        formData.append('pdf', pdfFile);

        try {
            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiURL}/api/article`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Artigo publicado com sucesso!');
                voltarParalista({preventDefault: () => {}})
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
            }
        } catch (e) {
            console.error('Erro ao salvar artigo:', e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="postagem-container">
            <main className="conteudo-principal">

                <header className="header-postagem">
                    <div>
                        <h1>Publicar Novo Artigo</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                            Faça o upload do PDF.
                        </p>
                    </div>
                    <button className="btn-publicar" onClick={handleSalvar} disabled={loading}>
                        {loading ? 'Publicando . . .': 'Publicar Artigo'}
                    </button>
                </header>

                <div>
                    <input
                        type="text"
                        className="input-titulo"
                        placeholder="Digite o titulo do artigo . . ."
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                    />

                    <div className="opcoes-extras">
                        <input
                            type="text"
                            className="input-extra"
                            placeholder="Palavras Chave (separadas por vírgula). . ."
                            value={palavrasChave}
                            onChange={(e) => setPalavrasChave(e.target.value)}
                        />
                    </div>

                    <div className="opcoes-extras banner-area" style={{ justifyContent: 'flex-start', gap: '15px' }}>
                        <button
                            className="btn-upload-banner"
                            onClick={() => pdfInputRef.current.click()}
                            style={{backgroundColor: pdfFile ? '#10b981' : '#0056b3'}}
                        >
                            <Upload size={18}/> {pdfFile ? 'Trocar PDF' : 'Anexar PDF (10mb)'}
                        </button>

                        <input
                            type="file"
                            accept="application/pdf"
                            ref={pdfInputRef}
                            onChange={handlePdfUpload}
                            style={{display: 'none'}}
                        />

                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {pdfFile ? (<><FileText size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {pdfFile.name})</>) : 'Nenhum arquivo selecionado'}
                        </span>
                    </div>
                    <div className="tiptap-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#1e293b' }}>Resumo (Abstract)</h3>
                        <textarea
                        style={{
                            width: '100%',
                            minHeight: '250px',
                            border: 'none',
                            outline: 'none',
                            resize: 'vertical',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            color: '#333'
                        }}
                        placeholder="Cole aqui o resumo do seu artigo para indexação nas buscas acadêmicas..."
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        />
                    </div>   
                </div>
            </main>
        </div>
    )
}
