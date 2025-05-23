
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VocabProvider } from "@/context/VocabContext";
import { AuthProvider } from "@/context/AuthContext";
import SettingsMenu from "@/components/SettingsMenu";
import Index from "./pages/Index";
import VocabList from "./pages/VocabList";
import Practice from "./pages/Practice";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="/practice/:urlDirection" element={
                <ProtectedRoute>
                  <Practice />
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
