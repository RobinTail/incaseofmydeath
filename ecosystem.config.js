const remotePath = '/var/www/incaseofmydeath';
const remoteHost = '157.230.21.197';
const remoteUser = 'root';

module.exports = {
  apps: [
    {
      name: 'API',
      script: 'dist/index.js',
      cwd: 'backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PORT: 80
      }
    },
  ],

  deploy : {
    production : {
      user: remoteUser,
      host: remoteHost,
      ref: 'origin/master',
      repo: 'git@github.com:RobinTail/incaseofmydeath.git',
      path: remotePath,
      'pre-deploy-local': [
        `rsync -a -v --delete backend/*.txt backend/*.pem ${remoteUser}@${remoteHost}:${remotePath}/source/backend/`
      ].join(' && '),
      'post-deploy' : [
        'source ~/.zshrc',
        'cd backend',
        'yarn install',
        'yarn build',
        'cd ..',
        'pm2 reload ecosystem.config.js'
      ].join(' && ')
    }
  }
};
