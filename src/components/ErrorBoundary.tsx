import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from './ui/button';
import * as Sentry from '@sentry/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo as any });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8 text-center text-foreground">
          <div className="mb-6 bg-destructive-subtle p-4 text-destructive">
            <CircleAlert className="size-8" aria-hidden="true" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mb-8 max-w-md text-foreground-secondary">
            An unexpected error occurred. We've logged the issue. Try refreshing, or clear your
            saved session if the problem repeats.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="border-destructive/30 text-destructive hover:bg-destructive-subtle"
            >
              Clear data &amp; restart
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
