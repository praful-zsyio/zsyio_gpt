import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ImageGenPage from './pages/ImageGenPage.jsx';
import VideoGenPage from './pages/VideoGenPage.jsx';
import PdfStudioPage from './pages/PdfStudioPage.jsx';
import UsagePage from './pages/UsagePage.jsx';
import AuthPage from './pages/AuthPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen min-h-[100dvh] flex flex-col bg-dark-950 text-slate-100 font-sans selection:bg-brand-cyan/30 selection:text-brand-cyan relative">
          <Navbar />
          <div className="flex-1 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/images" element={<ImageGenPage />} />
              <Route path="/videos" element={<VideoGenPage />} />
              <Route path="/pdf" element={<PdfStudioPage />} />
              <Route path="/usage" element={<UsagePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
