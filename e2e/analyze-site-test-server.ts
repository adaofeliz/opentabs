/**
 * Analyze-site E2E test server — simulates web applications with various
 * authentication patterns, API protocols, and framework markers.
 *
 * Each scenario is served under a distinct path prefix (e.g., /cookie-session/).
 * The plugin_analyze_site browser tool opens the URL in a new tab, captures
 * network traffic, and probes the page — so these pages must simulate
 * realistic web app behavior including session cookies, CSRF tokens, API
 * calls from the client, and framework globals.
 *
 * Scenarios:
 *   /cookie-session/    — Cookie-based session auth with CSRF meta tag and REST APIs
 *
 * Start: `bun e2e/analyze-site-test-server.ts`
 * Default port: 0 (dynamic, override with PORT env var)
 */

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ServerState {
  startedAt: number;
}

const state: ServerState = {
  startedAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Cookie-session scenario HTML
// ---------------------------------------------------------------------------

/**
 * Simulates a logged-in web app with:
 * - Session cookie (connect.sid) set via Set-Cookie on the page response
 * - CSRF meta tag in <head>
 * - REST API endpoints called by client-side JS on load
 * - A form with hidden CSRF input
 */
const COOKIE_SESSION_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="csrf-token" content="csrf-test-token-abc123" />
  <title>Cookie Session Test App</title>
</head>
<body>
  <div id="app">
    <h1>Dashboard</h1>
    <p id="status">Loading...</p>

    <form action="/cookie-session/api/update-profile" method="POST">
      <input type="hidden" name="authenticity_token" value="csrf-test-token-abc123" />
      <input type="text" name="display_name" placeholder="Display name" />
      <input type="email" name="email" placeholder="Email" />
      <button type="submit">Update Profile</button>
    </form>
  </div>

  <script>
    // Simulate client-side API calls that a real app would make on page load.
    // Uses relative URLs so the page works on any port.
    (async function() {
      try {
        var profileRes = await fetch('/cookie-session/api/profile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        var itemsRes = await fetch('/cookie-session/api/items', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        var profile = await profileRes.json();
        var items = await itemsRes.json();

        document.getElementById('status').textContent =
          'Loaded: ' + profile.user.name + ', ' + items.items.length + ' items';

        // Also make a POST request to test POST detection
        await fetch('/cookie-session/api/items', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Item', description: 'Test item' })
        });
      } catch (e) {
        document.getElementById('status').textContent = 'Error: ' + e.message;
      }
    })();
  </script>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 0;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // --- CORS preflight ---
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // --- Health check ---
    if (path === '/control/health') {
      return new Response(JSON.stringify({ ok: true, port: PORT, uptime: (Date.now() - state.startedAt) / 1000 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ===================================================================
    // Cookie-session scenario
    // ===================================================================

    // Page — serves HTML with Set-Cookie header
    if (path === '/cookie-session/' || path === '/cookie-session') {
      return new Response(COOKIE_SESSION_HTML, {
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': 'connect.sid=s%3Afake-session-id-12345.sig; Path=/; HttpOnly',
        },
      });
    }

    // REST API — GET /cookie-session/api/profile
    if (path === '/cookie-session/api/profile' && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          ok: true,
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // REST API — GET /cookie-session/api/items
    if (path === '/cookie-session/api/items' && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [
            { id: 'item-1', name: 'Alpha', description: 'First item' },
            { id: 'item-2', name: 'Bravo', description: 'Second item' },
            { id: 'item-3', name: 'Charlie', description: 'Third item' },
          ],
          total: 3,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // REST API — POST /cookie-session/api/items
    if (path === '/cookie-session/api/items' && req.method === 'POST') {
      let body: Record<string, unknown> = {};
      try {
        body = (await req.json()) as Record<string, unknown>;
      } catch {
        // ignore parse errors
      }
      return new Response(
        JSON.stringify({
          ok: true,
          item: {
            id: 'item-new',
            name: body.name ?? 'Unnamed',
            description: body.description ?? '',
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // REST API — POST /cookie-session/api/update-profile (form target)
    if (path === '/cookie-session/api/update-profile' && req.method === 'POST') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- 404 ---
    return new Response('Not found', { status: 404 });
  },
});

console.log(`[analyze-site-test-server] Listening on http://localhost:${String(server.port)}`);

// Ensure the process exits on SIGTERM/SIGINT
const shutdown = () => {
  void server.stop();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { server, state };
