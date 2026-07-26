import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Last line of defense: without this, an uncaught render error (a bad API
// response shape, a null-reference, etc.) unmounts the entire React tree and
// leaves a permanently blank/black page with nothing in the DOM to recover
// from — the user has to know to hit refresh. This renders a recoverable
// screen instead and logs the real error to the console for debugging.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Unhandled error in ZerCX AI UI:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-foreground">
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ocurrió un error inesperado al cargar esta pantalla. Intenta recargar la página.
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
