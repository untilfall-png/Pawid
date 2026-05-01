import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PetProvider, usePets } from './context/PetContext'
import { usePetTheme } from './hooks/usePetTheme'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import CreatePetPage from './pages/CreatePetPage'
import CedulaPage, { PublicProfilePage } from './pages/CedulaPage'
import DashboardPage from './pages/DashboardPage'
import CuidadoresPage from './pages/CuidadoresPage'
import RutasPage from './pages/RutasPage'
import DietaPage from './pages/DietaPage'
import VetChatPage from './pages/VetChatPage'
import WelcomeVideoPage from './pages/WelcomeVideoPage'
import PlaceholderPage from './pages/PlaceholderPage'

const NO_FOOTER = ['/dashboard', '/login', '/register', '/auth']
const NO_NAV    = ['/login', '/register', '/auth']

function ThemeSync() {
  const { currentTheme } = usePets()
  const theme = usePetTheme(currentTheme)
  useEffect(() => { theme.apply() }, [currentTheme])
  return null
}

// Redirige usuarios ya autenticados fuera de login/register
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function AnimatedRoutes() {
  const location  = useLocation()
  const showFooter = !NO_FOOTER.some(p => location.pathname.startsWith(p))
  const showNav    = !NO_NAV.some(p => location.pathname.startsWith(p))

  return (
    <>
      {showNav && <Navigation />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>
            {/* Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil/:pawid" element={<PublicProfilePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Solo invitados */}
            <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Protegidas */}
            <Route path="/crear"       element={<ProtectedRoute><CreatePetPage /></ProtectedRoute>} />
            <Route path="/cedula"      element={<ProtectedRoute><CedulaPage /></ProtectedRoute>} />
            <Route path="/cedula/:id"  element={<ProtectedRoute><CedulaPage /></ProtectedRoute>} />
            <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/cuidadores"  element={<Navigate to="/dashboard" replace />} />
            <Route path="/rutas"       element={<Navigate to="/dashboard" replace />} />
            <Route path="/dieta"       element={<Navigate to="/dashboard" replace />} />
            <Route path="/veterinario" element={<Navigate to="/dashboard" replace />} />
            <Route path="/bienvenida"  element={<ProtectedRoute><WelcomeVideoPage /></ProtectedRoute>} />

            <Route path="*" element={
              <PlaceholderPage title="Página no encontrada" icon="🔍"
                description="La página que buscas no existe o fue movida." />
            } />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showFooter && <Footer />}
      {showNav && <BottomNav />}
    </>
  )
}

function AppInner() {
  return (
    <>
      <CustomCursor />
      <ThemeSync />
      <AnimatedRoutes />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PetProvider>
          <AppInner />
        </PetProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
