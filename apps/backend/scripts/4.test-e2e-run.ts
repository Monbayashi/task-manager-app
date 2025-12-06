import { execSync } from 'child_process';

function run(cmd: string) {
  execSync(cmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      AWS_ACCESS_KEY_ID: 'dummy',
      AWS_SECRET_ACCESS_KEY: 'dummy',
    },
  });
}

try {
  console.log('LocalStack を起動しています...');
  run('node scripts/1.docker-start-localstack.ts');

  console.log('DynamoDB の起動を待っています...');
  run('node scripts/2.wait-for-dynamodb.ts');

  console.log('テーブルを作成しています...');
  run('node -r ts-node/register scripts/3.create-tables.ts');

  console.log('E2E テストを実行しています...');
  run('cross-env NODE_ENV=test jest --config ./jest.config.e2e.js --runInBand');
} finally {
  console.log('LocalStack を停止しています...');
  try {
    run('docker compose -f docker-compose.test.yml down -v');
  } catch (err) {
    console.error('LocalStack の停止に失敗しました:', err);
  }
}
