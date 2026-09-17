import * as Sentry from '@sentry/deno';

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN") || "https://3c07639ac9f315742ad89e80e3d4915e@o4512101797527552.ingest.de.sentry.io/4512101845499984",
  tracesSampleRate: 1.0,
});

export function withSentry(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    return await Sentry.withIsolationScope(async (scope) => {
      scope.setExtra("url", req.url);
      scope.setExtra("method", req.method);
      
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'authorization') {
          headers[key] = value;
        }
      });
      scope.setExtra("headers", headers);

      try {
        const response = await handler(req);
        return response;
      } catch (e) {
        Sentry.captureException(e);
        throw e;
      } finally {
        await Sentry.flush(2000);
      }
    });
  };
}

export { Sentry };
