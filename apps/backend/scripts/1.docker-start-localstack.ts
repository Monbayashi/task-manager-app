import { execSync } from 'child_process';

/** テスト用のlocalStackを起動 */
function main() {
  console.log('前回の localstack-backend-test を停止しています...');
  try {
    execSync('docker compose -f docker-compose.test.yml down -v', {
      stdio: 'ignore',
    });
  } catch {
    // down 失敗は正常
  }

  console.log('localstack-backend-test を起動しています...');
  try {
    execSync('docker compose -f docker-compose.test.yml up -d localstack', { stdio: 'inherit' });
  } catch (err) {
    console.error('localstack-backend-test の起動に失敗しました:', err);
    process.exit(1);
  }
  console.log('localstack-backend-test が起動しました。');
}

main();
