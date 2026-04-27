/**
 * EdgeIQ Subdomain Hunter — Cloudflare Worker
 * Passive subdomain enumeration via Certificate Transparency logs.
 * Wraps the crt.sh API and returns structured JSON results.
 */

interface Env {
  ALLOWED_ORIGIN?: string;
}

interface CrtShEntry {
  name_value: string;
  issue_date?: string;
  not_before?: string;
  not_after?: string;
}

interface SubdomainResult {
  subdomain: string;
  first_seen?: string;
  expiry?: string;
  issuer?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let body: { domain?: string; limit?: number };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const domain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const limit = Math.min(body.limit || 200, 500);

    if (!domain) {
      return new Response(JSON.stringify({ error: 'domain is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Basic validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
    if (!domainRegex.test(domain)) {
      return new Response(JSON.stringify({ error: 'Invalid domain format.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      // Query crt.sh Certificate Transparency logs
      const encodedDomain = encodeURIComponent(domain);
      const wildcardDomain = encodeURIComponent('%.' + domain);
      const crtUrl = `https://crt.sh/?q=${wildcardDomain}&output=json&limit=${limit}`;

      const crtResponse = await fetch(crtUrl, {
        headers: {
          'User-Agent': 'EdgeIQ-SubdomainHunter/1.0 (security research tool)',
          'Accept': 'application/json',
        },
        cf: { cacheTtl: 3600, cacheKey: `subdomain-${domain}` },
      } as RequestInit);

      if (!crtResponse.ok) {
        throw new Error(`crt.sh returned ${crtResponse.status}`);
      }

      let entries: CrtShEntry[] = [];
      try {
        const text = await crtResponse.text();
        const parsed = JSON.parse(text);
        entries = Array.isArray(parsed) ? parsed : [];
      } catch {
        entries = [];
      }

      // Deduplicate by subdomain name
      const seen = new Set<string>();
      const results: SubdomainResult[] = [];

      for (const entry of entries) {
        const nameValue = entry.name_value || '';
        // Split SANs (Subject Alternative Names) — can be newline or comma separated
        const names = nameValue.split(/[\n,]/).map((n: string) => n.trim().toLowerCase()).filter(Boolean);

        for (const name of names) {
          // Skip IP addresses
          if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(name)) continue;
          // Must contain the target domain
          if (!name.endsWith('.' + domain) && name !== domain) continue;
          // Skip exact domain (we want subdomains)
          if (name === domain || name === '*.' + domain) continue;

          if (!seen.has(name)) {
            seen.add(name);
            results.push({
              subdomain: name,
              first_seen: entry.not_before || entry.issue_date || undefined,
              expiry: entry.not_after || undefined,
            });
          }
        }
      }

      // Sort: shorter (closer to root) first
      results.sort((a, b) => a.subdomain.length - b.subdomain.length);

      return new Response(JSON.stringify({
        domain,
        total: results.length,
        subdomains: results,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return new Response(JSON.stringify({ error: `Scan failed: ${message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
