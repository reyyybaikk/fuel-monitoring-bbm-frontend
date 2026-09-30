// next.config.js – full CSP override to allow iframe embedding
module.exports = {
  // Disable the default 'X-Powered-By' header (optional but clean)
  poweredByHeader: false,

  // Global security headers
  async headers() {
    return [
      {
        // Apply to every route (HTML pages, API routes, static assets)
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow scripts, styles, fonts, images, and explicitly permit the backend to be framed
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "img-src 'self' data: https:; " +
              "frame-ancestors 'self' https://fuel-monitoring-system.onrender.com;",
          },
          {
            key: 'X-Frame-Options',
            // "ALLOWALL" disables same‑origin enforcement (CSP already handles it)
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};
