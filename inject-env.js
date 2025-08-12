// inject-env.js
const fs = require('fs');
const path = require('path');

// Carrega as variáveis do Netlify
const env = process.env;

// Lê o arquivo HTML
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Injeta as variáveis como um script global
const injectScript = `
<script>
  window.FIREBASE_API_KEY = "${env.FIREBASE_API_KEY}";
  window.FIREBASE_AUTH_DOMAIN = "${env.FIREBASE_AUTH_DOMAIN}";
  window.FIREBASE_DATABASE_URL = "${env.FIREBASE_DATABASE_URL}";
  window.FIREBASE_PROJECT_ID = "${env.FIREBASE_PROJECT_ID}";
  window.FIREBASE_STORAGE_BUCKET = "${env.FIREBASE_STORAGE_BUCKET}";
  window.FIREBASE_MESSAGING_SENDER_ID = "${env.FIREBASE_MESSAGING_SENDER_ID}";
  window.FIREBASE_APP_ID = "${env.FIREBASE_APP_ID}";
  window.FIREBASE_MEASUREMENT_ID = "${env.FIREBASE_MEASUREMENT_ID}";
</script>
`;

// Insere o script antes do fechamento do </head>
html = html.replace('</head>', `${injectScript}</head>`);

// Salva o arquivo modificado
fs.writeFileSync(htmlPath, html);
