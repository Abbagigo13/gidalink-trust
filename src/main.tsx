import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { RequireAuth, RequireRole } from './components/RouteGuards.tsx'
import AuthPage from './pages/AuthPage.tsx'
import DashboardLayout from './dashboard/DashboardLayout.tsx'
import Overview from './dashboard/pages/Overview.tsx'
import MyListings from './dashboard/pages/MyListings.tsx'
import ListingForm from './dashboard/pages/ListingForm.tsx'
import Saved from './dashboard/pages/Saved.tsx'
import Inspections from './dashboard/pages/Inspections.tsx'
import ReviewQueue from './dashboard/pages/ReviewQueue.tsx'
import Reports from './dashboard/pages/Reports.tsx'
import Admin from './dashboard/pages/Admin.tsx'
import Quality from './dashboard/pages/Quality.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public landing page (the existing marketplace experience) */}
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Signed-in dashboard */}
          <Route path="/app" element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="saved" element={<Saved />} />
              <Route path="inspections" element={<Inspections />} />

              <Route element={<RequireRole roles={['landlord', 'agent', 'admin']} />}>
                <Route path="listings" element={<MyListings />} />
              </Route>
              <Route element={<RequireRole roles={['landlord', 'agent']} />}>
                <Route path="listings/new" element={<ListingForm />} />
              </Route>
              <Route element={<RequireRole roles={['landlord', 'agent', 'admin']} />}>
                <Route path="listings/:id" element={<ListingForm />} />
              </Route>

              <Route element={<RequireRole roles={['verifier', 'admin']} />}>
                <Route path="review" element={<ReviewQueue />} />
                <Route path="reports" element={<Reports />} />
                <Route path="quality" element={<Quality />} />
              </Route>
              <Route element={<RequireRole roles={['admin']} />}>
                <Route path="admin" element={<Admin />} />
              </Route>

              <Route path="*" element={<Overview />} />
            </Route>
          </Route>

          <Route path="*" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
