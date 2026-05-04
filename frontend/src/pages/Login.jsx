import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import LoginForm from '../components/LoginForm.jsx';
import './Login.css';

export default function Login() {
  return (
    <div className='page-container'>
      <Header 
        botaoAmarelo={false}
        backgroundScroll={false}
      />
      <main className='main-content'>
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
  //   
}