import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import DashboardAdminBody from "../components/DashboardAdminBody";
import './DashboardAdmin.css';

export default function DashboardAdmin() {
  return (
    <div className="page-adm-container">
      <Header 
        botaoAmarelo={true}
        backgroundScroll={false} 
      />
      <DashboardAdminBody />      
      <Footer />
    </div>
  );
}