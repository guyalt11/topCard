import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { VocabProvider } from "@/context/VocabContext";
import { AuthProvider } from "@/context/AuthContext";
import SettingsMenu from "@/components/SettingsMenu";
import Index from "./pages/Index";
import VocabList from "./pages/VocabList";
import Practice from "./pages/Practice";
import PracticeAll from "./pages/PracticeAll";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import TokenExpiryChecker from "./components/TokenExpiryChecker";

const queryClient = new QueryClient();

// Component to handle GA page tracking on route change
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA if not already
    if (!(window as any).gtag) {
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = "https://www.googletagmanager.com/gtag/js?id=G-SY793CMP18";
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SY793CMP18');
      `;
      document.head.appendChild(script2);
    }

    // Track page view on route change
    (window as any).gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <TokenExpiryChecker />
          <VocabProvider>
            <Toaster />
            <Sonner />
            <div className="fixed top-2 right-2 z-50">
              <SettingsMenu />
            </div>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/list/:listId" element={
                <ProtectedRoute>
                  <VocabList />
                </ProtectedRoute>
              } />
              <Route path="/practice/:listId" element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              } />
              <Route path="/practice-all" element={
                <ProtectedRoute>
                  <PracticeAll />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VocabProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
