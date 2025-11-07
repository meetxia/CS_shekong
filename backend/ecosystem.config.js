module.exports = {
  apps: [{
    name: 'shekong-ai-backend',
    script: './server.js',
    instances: 2, // 使用2个实例（集群模式）
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    watch: false,
    // 环境变量从.env文件加载
    env_file: '.env'
  }]
};
