/**
 * Helper script to encode Firebase service account for deployment
 * Run: node scripts/prepare-firebase-env.js
 */

const fs = require('fs');
const path = require('path');

const firebaseFile = path.resolve('./firebase-service-account.json');

if (!fs.existsSync(firebaseFile)) {
  console.error('❌ Firebase service account file not found!');
  console.error('   Expected: firebase-service-account.json');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(firebaseFile, 'utf8'));
  
  // Encode to base64
  const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');
  
  console.log('✅ Firebase service account encoded!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Copy this value to your deployment platform:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(base64);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📝 Add this as environment variable:');
  console.log('   Variable name: FIREBASE_SERVICE_ACCOUNT');
  console.log('   Variable value: <paste the base64 string above>');
  console.log('');
  console.log('💡 Or you can use the JSON directly:');
  console.log('   Variable name: FIREBASE_SERVICE_ACCOUNT');
  console.log('   Variable value: ' + JSON.stringify(serviceAccount));
  console.log('');
} catch (error) {
  console.error('❌ Error encoding Firebase file:', error.message);
  process.exit(1);
}
