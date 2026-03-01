import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-4xl font-bold">Erreur</h1>
          <p className="text-muted-foreground text-center max-w-md">
            {this.state.error?.message || "Une erreur inattendue s'est produite."}
          </p>
          <Button variant="outline" onClick={this.handleRetry}>
            Réessayer
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
