module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/src/main.js',
      instances: 0, // 0으로 설정 시 cpu core 만큼 생성
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 50000,
      kill_timeout: 5000,
      env: { NODE_ENV: process.env.NODE_ENV, PORT: process.env.port },
      autorestart: true,
    },
  ],
};
