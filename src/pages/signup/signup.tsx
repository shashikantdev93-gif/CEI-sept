import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/main.css";
import Logo from "../../components/Logo/Logo";
import PageHeader from "../../components/PageComponent/PageHeader";
import Illustration from "../../components/Illustration/Illustration";
import Footer from "../../components/Footer/Footer";
import CardContainer from "../../components/CardContainer/CardContainer";
import { SignupForm } from "../../components/auth";

const Signup = () => {

  return (
    <div className="login-bg d-flex align-items-center justify-content-center">
      <CardContainer>
        <div className="row g-0 w-100">
          {/* Left Side - Form */}
          <div className="col-md-7 login-left bg-white d-flex flex-column justify-content-center">
            <div className="signup-logo-box">
              <Logo title="Chief Electric" subtitle="Inspector" titleColor="#0c3064" subtitleColor="#0c3064" />
            </div>
            <PageHeader title="" subtitle="Please enter below details to continue." />
            
            <SignupForm/>

          </div>
          
          {/* Divider */}
            <div className="login-divider" />
          
          {/* Right Side - Illustration */}
          <div className="col-md-4 login-right px-1 ms-4 d-flex align-items-center justify-content-center">
            <Illustration src="/assets/images/login_img.png" alt="Login Illustration" />
          </div>
        </div>
      </CardContainer>
      
      <Footer />
    </div>
    
  );
};

export default Signup;
