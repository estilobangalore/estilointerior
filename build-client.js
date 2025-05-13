import { execSync } from 'child_process';

console.log('Building client...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Client build completed successfully');
} catch (error) {
  console.error('Client build failed:', error);
  process.exit(1);
}