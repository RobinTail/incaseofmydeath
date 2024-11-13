// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS
const fs = require("node:fs");

let secrets = {
  user: "",
  host: "",
  path: "",
};
if (fs.existsSync("secrets.json")) {
  secrets = JSON.parse(fs.readFileSync("secrets.json", "utf-8"));
}

module.exports = {
  apps: [
    {
      name: "API",
      script: "dist/index.js",
      cwd: "backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "Disposer",
      script: "dist/disposer.js",
      cwd: "backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
  ],

  deploy: {
    production: {
      user: secrets.user,
      host: secrets.host,
      ref: "origin/master",
      repo: "git@github.com:RobinTail/incaseofmydeath.git",
      path: secrets.path,
      "pre-deploy-local": [
        "yarn workspace backend install",
        "yarn workspace backend build",
        `rsync -a -v --delete secrets.json ${secrets.user}@${secrets.host}:${secrets.path}/source/`,
        `rsync -a -v --delete backend/*.txt backend/*.pem backend/dist ${secrets.user}@${secrets.host}:${secrets.path}/source/backend/`,
      ].join(" && "),
      "post-deploy": [
        "source ~/.zshrc",
        "yarn workspace backend install --production --frozen-lockfile",
        "pm2 reload ecosystem.config.cjs",
      ].join(" && "),
    },
  },
};
