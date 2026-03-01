import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from "@/components/fallback/ErrorBoundary"
import LoadingSpinner from "@/components/fallback/LoadingSpinner"
import { RootLayout } from "@/layouts/RootLayout"

const Home = lazy(() => import("@/pages/home/Home"))
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"))
const Todos = lazy(() => import("@/pages/todos/Todos"))
const Documents = lazy(() => import("@/pages/documents/Documents"))
const DocumentDetail = lazy(() => import("@/pages/documents/DocumentDetail"))
const NotFound = lazy(() => import("@/components/fallback/NotFound"))

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={300}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="todos" element={<Todos />} />
                <Route path="documents" element={<Documents />} />
                <Route path="documents/:id" element={<DocumentDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App
