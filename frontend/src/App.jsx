//region IMPORTAR DEPENDENCIAS
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardMember from './pages/DashboardMember.jsx';
import PostPublico from './pages/PostPublico.jsx';
import Publicacoes from './pages/Publicacoes.jsx';
//endregion



//region FUNÇÃO DE PROTEÇÃO
const ProtectedRoutes = ({children, roleExigido}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  //Para proteger as rotas de outros tipos de usuários
  if (roleExigido && role !== roleExigido) {
    alert('Acesso Negado! Você não tem permissão!');
    return <Navigate to="/" replace />;
  }
  return children;
};
//endregion

 //region
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*MARK:ROTAS PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/post/:id" element={<PostPublico />} />
        <Route path="/post" element={<Publicacoes />}/>

        {/* ROTAS PROTEGIDAS - ADMIN */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoutes roleExigido="ADMIN">
              <DashboardAdmin />
            </ProtectedRoutes>
          }
        />

        {/* ROTAS PROTEGIDAS - MEMBER */}
        <Route
          path="/dashboard/member"
          element={
            <ProtectedRoutes roleExigido="MEMBER">
              <DashboardMember />
            </ProtectedRoutes>
          }
        />

        {/* ROTA NÃO ENCONTRADA JOGA PRA O LOGIN */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>  
  )
} 

export default App;

//endregion
