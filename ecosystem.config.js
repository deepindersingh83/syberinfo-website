/**
 * PM2 process config for running the SyberInfo site on a CloudPanel VPS.
 *
 *   npm ci && npm run build
 *   pm2 start ecosystem.config.js
 *   pm2 save && pm2 startup
 *
 * Uses the Next.js "standalone" output (see next.config.ts). nginx (CloudPanel)
 * reverse-proxies port 3000 to this process.
 */
module.exports = {
  apps: [
    {
      name: "syberinfo",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
