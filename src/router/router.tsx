
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import CommonApplicationFormUserDetails from "../pages/common-application-form-user-details/common-application-form-userDetails";
import Dashboard from "../pages/dashboard/dashboard";
import ProjectDetails from "../pages/project-details/project-details";
import ApplicationForm from "../pages/ApplicationForm/ApplicationForm";
import CommonApplicationFormEstablished from "../pages/common-application-form-established/common-application-form-established";
import ContractorApplicantDetails from "../pages/contractor-applicant-details/ContractorApplicantDetails";
import ContractorSupervisor from "../pages/contractor-supervisor/contractor-supervisor";
import ContractorDocuments from "../pages/contractor-documents/contractor-documents";
import SupervisorRegistration from "../pages/supervisor-registration/supervisor-registration"; 
import UploadSupervisorDocument from "../pages/upload-supervisor-document/upload-supervisor-document"; 
import WiremanInformationNew from "../pages/wireman-information/wireman-information";
import UploadWiremanDocument from "../pages/upload-wireman-document/upload-wireman-document";
import UserDetails from "../pages/user-details/UserDetails";
import ProcessApplication from "../pages/process-application/ProcessApplication";
import ViewApplication from "../pages/view-application/ViewApplication";
import AdminDashboard from "../pages/admin-dashboard/AdminDashboard";
import OfficerDashboard from "../pages/officer-dashboard/OfficerDashboard";
import LicenseDashboard from "../pages/license-dashboard/LicenseDashboard"; 



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
      {/* Role-based Dashboard routes - Angular parity */}
      <Route
        path="/dashboard/admin-dashboard"
        element={
          <BaseLayout headerType="Header1">
            <AdminDashboard />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/officer-dashboard"
        element={
          <BaseLayout headerType="Header1">
            <OfficerDashboard />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/license-dashboard"
        element={
          <BaseLayout headerType="Header1">
            <LicenseDashboard />
          </BaseLayout>
        }
      />
      {/* Common Application Form routes - matching Angular structure */}
      <Route
        path="/dashboard/caf/userDetails"
        element={
          <BaseLayout headerType="Header1">
            <CommonApplicationFormUserDetails />
          </BaseLayout>
        }
      />
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
        path="/dashboard/ProjectDetails/applicationForm/contractor-supervisor"
        element={
          <BaseLayout headerType="Header1">
            <ContractorSupervisor />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/license/contractor-supervisor"
        element={
          <BaseLayout headerType="Header1">
            <ContractorSupervisor />
          </BaseLayout>
        }
      />
      <Route
        path="/dashboard/license/attachments"
        element={
          <BaseLayout headerType="Header1">
            <ContractorDocuments />
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
        path="/dashboard/ProjectDetails/applicationForm/wireman-information"
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
      <Route
        path="/admin/user-details"
        element={
          <BaseLayout headerType="Header1">
            <UserDetails />
          </BaseLayout>
        }
      />
      <Route
        path="/admin/process-application"
        element={
          <BaseLayout headerType="Header1">
            <ProcessApplication />
          </BaseLayout>
        }
      />
      <Route
        path="/admin/view-application"
        element={
          <BaseLayout headerType="Header1">
            <ViewApplication />
          </BaseLayout>
        }
      />
       
    </Routes>
  </Router>
);

export default RouterPage;