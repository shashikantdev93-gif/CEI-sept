
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import Register from "../pages/register/register";


const RouterPage = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/RegisterationForm"
        element={
          <BaseLayout headerType="Header1">
            <Register />
          </BaseLayout>
        }
      />
    </Routes>
  </Router>
);

export default RouterPage;