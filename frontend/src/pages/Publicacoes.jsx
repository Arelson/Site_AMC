import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Blog from "../components/Blog";
import { useState } from "react";
import './Publicacoes.css';


export default function Publicacoes() {
  const [blog, setBlog] = useState(true);
  const [revistas, setRevistas] = useState(false);
  const [artigos, setArtigos] = useState(false);

  const handleBlog = () => {
    setBlog(true);
    setRevistas(false);
    setArtigos(false);
  }
  const handleRevistas = () => {
    setBlog(false);
    setRevistas(true);
    setArtigos(false);
  }
  const handleArtigos = () => {
    setBlog(false);
    setRevistas(false);
    setArtigos(true);
  }
  return (
    <div>
      <Header 
        botaoAmarelo={true}
        backgroundScroll={false} 
      />

      <div className="publicacoes-container">
        <div className="publicacoes-ct-banner">
          <h1>Produção Intelectual</h1>
          <p>Acesse nosso repositório de revistas, e-books e as publicações no vlog de nossos acadêmicos</p>
        </div>
        <div className="publicacoes-ct-content">
          <aside className="publicacoes-ct-content-aside">
            <h2>Tipos de Publicações</h2>

            <button 
              onClick={handleBlog} 
              className={`publicacoes-ct-content-aside-bt ${blog ? 'active' : 'desactive'}`}
            >
              Blog
            </button>

            <button 
              onClick={handleRevistas}
              className={`publicacoes-ct-content-aside-bt ${revistas ? 'active' : 'desactive'}`}
            >
              Revistas
            </button>

            <button 
              onClick={handleArtigos}
              className={`publicacoes-ct-content-aside-bt ${artigos ? 'active' : 'desactive'}`}
            >
              Artigos
            </button>

          </aside>
          <main className="publicacoes-ct-content-main">
            {blog && <Blog />}
            {revistas && <p>Revistas</p>}
            {artigos && <p>Artigos</p>}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}