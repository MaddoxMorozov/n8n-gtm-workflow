const fs = require('fs');
const w = JSON.parse(fs.readFileSync('NewGTM.json', 'utf8'));
const n = w.nodes.find(n => n.name === 'Process Enrich Request');

if (n) {
  // Update the callback URL line
  n.parameters.jsCode = n.parameters.jsCode.replace(
    /const callbackUrl = 'https:\/\/YOUR_N8N_HOST\/webhook\/signalhire-callback';/,
    "// ⚠️ REPLACE THIS WITH YOUR PUBLIC URL (e.g. ngrok or Render)\nconst callbackUrl = 'https://YOUR-PUBLIC-URL/webhook/signalhire-callback';"
  );
  
  fs.writeFileSync('NewGTM.json', JSON.stringify(w, null, 2));
  console.log('✓ Updated placeholder URL');
} else {
  console.log('✗ Node not found');
}
