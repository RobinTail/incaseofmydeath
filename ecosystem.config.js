const fs = require('fs');

let secrets = {
  user: '',
  host: '',
  path: '',
}
if (fs.existsSync("secrets.json")) {
  secrets = JSON.parse(fs.readFileSync("secrets.json", "utf-8"));
}

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
      user: secrets.user,
      host: secrets.host,
      ref: 'origin/master',
      repo: 'git@github.com:RobinTail/incaseofmydeath.git',
      path: secrets.path,
      'pre-deploy-local': [
        `rsync -a -v --delete secrets.json ${secrets.user}@${secrets.host}:${secrets.path}/source/`,
        `rsync -a -v --delete backend/*.txt backend/*.pem ${secrets.user}@${secrets.host}:${secrets.path}/source/backend/`
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
