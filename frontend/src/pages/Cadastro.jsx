import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import CadastroForm from "../components/CadastroForm.jsx";
import './Cadastro.css';

export default function Cadastro() {
  return (
    <div className="page-container">
      <Header 
        botaoAmarelo={false}
        backgroundScroll={false}   
      />
      <main className="main-content">
        <CadastroForm />
      </main>
      <Footer />
    </div>
  )
} 