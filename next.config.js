module.exports = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow the backend to be framed and also keep self‑origin allowed
            value: "frame-ancestors 'self' https://fuel-monitoring-system.onrender.com",
          },
          {
            key: 'X-Frame-Options',
            // Explicitly allow any origin (or omit to rely on CSP)
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};
