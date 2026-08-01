/**
 * Mounts the FE-06 App Router-style chat handler under Vite's dev/preview server.
 * Keeps OPENAI_API_KEY on the Node side only.
 */
export function aiChatApiPlugin() {
  return {
    name: 'taskforge-ai-chat-api',
    configureServer(server) {
      server.middlewares.use(createChatMiddleware(server));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createChatMiddleware(server));
    },
  };
}

function createChatMiddleware(server) {
  return async function aiChatMiddleware(req, res, next) {
    const url = req.url?.split('?')[0];
    if (url !== '/api/chat' || req.method !== 'POST') {
      next();
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks);

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value == null) continue;
        headers.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers,
        body: rawBody,
      });

      const mod = await server.ssrLoadModule('/src/app/api/chat/route.ts');
      const response = await mod.POST(request);

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'transfer-encoding') return;
        res.setHeader(key, value);
      });

      if (!response.body) {
        const text = await response.text();
        res.end(text);
        return;
      }

      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      };

      req.on('close', () => {
        reader.cancel().catch(() => {});
      });

      await pump();
    } catch (error) {
      console.error('[ai-chat-api]', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Chat API failed',
        }),
      );
    }
  };
}
