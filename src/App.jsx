import React, { useEffect } from "react";
import Login from "./components/Login/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import './App.css'
import ReplyPage from "./components/Reports/ReplyPage";
import { Reports } from "./components/UserDetails/Reports";
import { MessageReports } from "./components/MessageStatus/MessageReports";
import { SubmittedTemplates } from "./components/Templates/SubmittedTemplate";
import CreateTemp from "./components/Templates/CreateTemp";
import { PreviewTemp } from "./components/Templates/PreviewTemp";
import WhatsAppOnboarding from "./components/whatsappOnboarding";
import { ContactList } from "./components/ContactList";
import { AllCampaign } from "./components/Campaign/AllCampaigns";
import CampaignDetails from "./components/Campaign/CampaignDetails";
import FlowBuilder from "./components/FlowBuilder/flowBuilder";
import QuizReports from "./components/QuizReports";
import GlobalLayout from "./Layouts/GlobalLayout";
import NewFlowBuilder from "./components/FlowBuilder/NewFlowBuilder";
import FlowLibraryPage from "./components/FlowLibrary/FlowLibraryPage";


const App = () => {
  useEffect(()=>{
    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification");
    } else {
      console.log("Notifications are supported");
    }
  },[])

  return (
    <>
      <BrowserRouter>
        <Routes basename="/">
          <Route path="/" element={<Login />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/user-reports/:id" element={<Reports />} />
          <Route path="/message-status/:id" element={<MessageReports />} />
          <Route path="/previewTemp/:id" element={<PreviewTemp />} />
          <Route path="/whatsappOnBoarding/:id" element={<WhatsAppOnboarding />} />
          <Route path="/quizReports/:id" element={<QuizReports />} />
          <Route element={<GlobalLayout />} >
          <Route path="/replyPage/:id" element={<ReplyPage />} />
<Route path="/replyPage/:id/:mobNo" element={<ReplyPage />} />
            <Route path="/contactList/:id" element={<ContactList />} />
            <Route path="/campaign/:id" element={<AllCampaign />} />
            <Route path="/singleCampaignDetail/:id" element={<CampaignDetails />} />
            <Route path="/fetchAllTemplates/:id" element={<SubmittedTemplates />} />
            <Route path="/createTemplate/:id" element={<CreateTemp />} />
            <Route path="/flowBuilder/:id" element={<FlowBuilder />} />
            <Route path="/flowLibrary/:id" element={<FlowLibraryPage />} />
            <Route
              path="/new-flow-builder/:id"
              element={<NewFlowBuilder />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
