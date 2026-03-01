import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from "@/components/fallback/ErrorBoundary"
import LoadingSpinner from "@/components/fallback/LoadingSpinner"
import { RootLayout } from "@/layouts/RootLayout"

const ChapterPage = lazy(() => import("@/pages/chapter/ChapterPage"))
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
                <Route index element={<Navigate to="/chapitres/1" replace />} />
                <Route path="chapitres/:chapterId" element={<ChapterPage />} />
                <Route path="chapitres/:chapterId/documents/:id" element={<DocumentDetail />} />
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
