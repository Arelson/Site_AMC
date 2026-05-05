import React from 'react';
import Header from '../components/layouts/Header.jsx';
import Footer from '../components/layouts/Footer.jsx';
import Post from '../components/Post.jsx';
import './PostPublico.css';
import 'katex/dist/katex.min.css';

export default function PostPublico() {
  return (
    <div className='container-post'>
      <Header 
        botaoAmarelo={true}
        backgroundScroll={false} 
      />
      <Post />
      <Footer />
    </div>
  )
}