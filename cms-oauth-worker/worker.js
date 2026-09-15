/**
 * GitHub OAuth helper for the Decap CMS admin at /admin on the Relentless
 * Frames site.
 *
 * Why this exists: the site is hosted on GitHub Pages, which only serves
 * static files — it can't check a password or exchange an OAuth code for
 * a token. This tiny Cloudflare Worker is the one piece of "server" the
 * setup needs, and it does only one job: handle the GitHub login handshake
 * so the studio owner can sign in at /admin and save photo changes, which
 * Decap then commits straight to the GitHub repo.
 *
 * Deploy this file as a Cloudflare Worker (see CMS-SETUP.md in the project
 * root for exact steps) and set two secrets on it:
 *   GITHUB_CLIENT_ID      — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  — from your GitHub OAuth App
 *
 * Nothing here needs editing for a typical setup.
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function html(body) {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const state = randomState();
      const redirectUri = `${url.origin}/callback`;
      const authorize = new URL(GITHUB_AUTHORIZE_URL);
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', redirectUri);
      authorize.searchParams.set('scope', 'repo,user');
      authorize.searchParams.set('state', state);

      const headers = new Headers({ Location: authorize.toString() });
      // Short-lived cookie so /callback can confirm this request started here.
      headers.append(
        'Set-Cookie',
        `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
      );
      return new Response(null, { status: 302, headers });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('Cookie') || '';
      const cookieState = (cookie.match(/oauth_state=([^;]+)/) || [])[1];

      if (!code || !state || !cookieState || state !== cookieState) {
        return html(renderResult('error', 'State mismatch or missing code. Please try logging in again.'));
      }

      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });

      if (!tokenRes.ok) {
        return html(renderResult('error', 'GitHub did not accept the login. Please try again.'));
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return html(renderResult('error', tokenData.error_description || 'No access token returned by GitHub.'));
      }

      return html(renderResult('success', null, tokenData.access_token));
    }

    return new Response('Not found', { status: 404 });
  },
};

/**
 * Renders the popup page that completes the handshake Decap CMS expects:
 * it waits for the opener (the /admin page) to signal it's ready, then
 * posts the token back and closes itself.
 */
function renderResult(status, message, token) {
  const payload = status === 'success'
    ? JSON.stringify({ token, provider: 'github' })
    : JSON.stringify({ provider: 'github' });

  return `<!doctype html>
<html><body>
<p>${status === 'success' ? 'Signed in — you can close this window.' : 'Sign-in failed: ' + (message || 'unknown error')}</p>
<script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:${status}:${payload.replace(/</g, '\\u003c')}',
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body></html>`;
}
