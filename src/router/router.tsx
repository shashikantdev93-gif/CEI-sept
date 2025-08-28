
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import CommonApplicationFormUserDetails from "../pages/common-application-form-user-details/common-application-form-userDetails";
import Dashboard from "../pages/dashboard/dashboard";
import ProjectDetails from "../pages/project-details/project-details";
import ApplicationForm from "../pages/ApplicationForm/ApplicationForm";
import CommonApplicationFormEstablished from "../pages/common-application-form-established/common-application-form-established";
import ContractorApplicantDetails from "../pages/Contractor - Applicant Details/ContractorApplicantDetails";
import SupervisorRegistration from "../pages/Supervisor Registration/supervisor-registration"; 
import UploadSupervisorDocument from "../pages/upload-supervisor-document/upload-supervisor-document"; 
import WiremanInformationNew from "../pages/Wireman Information-New/wireman-information-new";
import UploadWiremanDocument from "../pages/upload-wireman-document/upload-wireman-document"; 



const RouterPage = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/CommonApplicationFormUserDetails"
        element={
          <BaseLayout headerType="Header1">
            <CommonApplicationFormUserDetails />
          </BaseLayout>
        }
      />
      <Route
        path="/CommonApplicationFormEstablished"
        element={
          <BaseLayout headerType="Header1">
            <CommonApplicationFormEstablished />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <BaseLayout headerType="Header1">
            <Dashboard />
          </BaseLayout>
        }
      />
      {/* Common Application Form routes - matching Angular structure */}
      <Route
        path="/dashboard/caf/projectSite"
        element={
          <BaseLayout headerType="Header1">
            <CommonApplicationFormEstablished />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/ProjectDetails"
        element={
          <BaseLayout headerType="Header1">
            <ProjectDetails />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/ProjectDetails/applicationForm"
        element={
          <BaseLayout headerType="Header1">
            <ApplicationForm />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/ProjectDetails/applicationForm/contractor-applicant-details"
        element={
          <BaseLayout headerType="Header1">
            <ContractorApplicantDetails />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/ProjectDetails/applicationForm/supervisor-registration"
        element={
          <BaseLayout headerType="Header1">
            <SupervisorRegistration />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-supervisor-document"
        element={
          <BaseLayout headerType="Header1">
            <UploadSupervisorDocument />
          </BaseLayout>
        }
       
      />
       <Route
        path="/dashboard/ProjectDetails/applicationForm/wireman-information-new"
        element={
          <BaseLayout headerType="Header1">
            <WiremanInformationNew />
          </BaseLayout>
        }
       
      />
      <Route
        path="/dashboard/ProjectDetails/applicationForm/supervisor-registration/upload-wireman-document"
        element={
          <BaseLayout headerType="Header1">
            <UploadWiremanDocument />
          </BaseLayout>
        }
       
      />
       
    </Routes>
  </Router>
);

export default RouterPage;