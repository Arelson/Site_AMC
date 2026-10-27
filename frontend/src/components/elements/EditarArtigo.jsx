import React, { useState, useEffect } from "react";
import './CriarPost.css'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function EditarArtigo({artigoId, handlevoltar}){
    const [title, setTitle] = useState('');
    const [abstract, setAbstract ] = useState('');
    const [keywords, setKeywords] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfAtual, setPdfAtual] = useState('');

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(()=>{
        const carregaArtigo = async () =>{
            try {
                const response = await fetch(`${apiURL}/api/article/${artigoId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    }
                });

                if(response.ok){
                    const data = await response.json();

                    setTitle(data.title || '');
                    setAbstract(data.abstract || '');
                    setKeywords(data.keywords || '');
                    setPdfAtual(data.pdfUrl || '');
                }else{
                    alert('Erro ao carregar os dados do artigo.');
                    handlevoltar();
                }

            } catch (error) {
                console.error("Error: ", error);
            }finally{
                setLoading(false);
            }
        };

        if(artigoId) carregaArtigo();
    }, [artigoId, handlevoltar]);

    const handleAtualizar = async (e) =>{
        e.preventDefault();
        setSalvando(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('abstract', abstract);
        formData.append('keywords', keywords);

        if (pdfFile){
            formData.append('pdf', pdfFile);
        }

        try {
            const response = await fetch(`${apiURL}/api/article/${artigoId}`,{
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if(response.ok){
                alert(`Artigo atualizado com sucesso.`);
                handlevoltar();
            }else{
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
            }

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro de conexão ao salvar o artigo.');
        } finally {
            setSalvando(false);
        }
    };

    if (loading){
        return <div style={{padding: '40px', textAlign: 'center'}}>Carregando dados do artigo...</div>;
    }

    return(
        <div className="postagem-container">
            <div className="header-postagem">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                <button
                    type="button"
                    onClick={handlevoltar}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#555', padding: '5px'
                    }}
                >
                    ←
                </button>
                <h2 style={{margin:0, color: '#333'}}>Edita Artigo Cientifico</h2>
            </div>
                <button
                    type="submit"
                    form="form-editar-artigo"
                    className="btn-publicar"
                    disabled={salvando}
                >   
                {salvando ? 'Salvando . . .' : 'Salavar Alterações'}
                </button>
            </div>
            
            <form id="form-editar-artigo" onSubmit={handleAtualizar} className="card-editor">
                <input 
                    type="text" 
                    className="input-titulo"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                    placeholder="Titulo do artigo . . ."
                    required
                    />

                <div className="opcoes-extras">
                    <input 
                        type="text" 
                        className="input-extra"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Palavras-chaves separadas por virgula (ex: IA, React, Algoritmos)"
                        />
                </div>

                <div className="opcoes-extras" style={{alignItems: 'center', backgroundColor: '#f9f9f9', padding: '15px', borderRadius:'8px', border: '1px solid #eaeaea'}}>
                    <div style={{flex: 1}}>
                        <span style={{display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444'}}>
                          Arquivo PDF
                        </span>

                        {pdfAtual && (
                            <div style={{fontSize:'13px', marginBottom: '8px'}}>
                                Documento Atual: {''}
                                <a href={`${apiURL}${pdfAtual}`} target="_blank" rel="noreferrer" style={{color: '#007bff', textDecoration: 'none'}}>
                                    Visualizar Arquivo
                                </a>
                            </div>
                        )}

                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <label className="btn-upload-banner">
                                @ Substuir PDF
                                <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                style={{display: 'none'}} />
                            </label>

                            {pdfFile && <span style={{fontSize: '13px', color: '#28a745'}}>{pdfFile.name} será enviado</span>}
                            {!pdfFile && <span style={{fontSize: '12px', color: '#888'}}>Deixe vazio para manter o PDF atual</span>}
                        </div>
                    </div>
                </div>

                <div className="tiptap-wrapper" style={{marginTop: '20px'}}>
                    <div className="toolbar">
                        <span style={{fontSize: '14px', fontWeight:'bold', color:'#555', paddingLeft: '5px'}}>Resumo (Abstract)</span>
                    </div>

                    <div className="tiptap-editor-area" style={{padding: '0'}}>
                        <textarea 
                            value={abstract}
                            onChange={(e) => setAbstract(e.target.value)}
                            placeholder="Digite o resumo do artigo aqui . . ."
                            required
                            style={{
                                width: '100%',
                                minHeight: '300px',
                                padding: '20px',
                                border: 'none',
                                outline: 'none',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                color: '#333',
                                resize: 'vertical',
                                background: 'transparent',
                                boxSizing: 'border-box'
                            }}
                        ></textarea>
                    </div>
                </div>

            </form>
            
        </div>
    )
};
