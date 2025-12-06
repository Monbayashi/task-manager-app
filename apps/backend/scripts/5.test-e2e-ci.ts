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

console.log('テーブルを作成しています...');
run('node -r ts-node/register scripts/3.create-tables.ts');

console.log('E2E テストを実行しています...');
run('cross-env NODE_ENV=test jest --config ./jest.config.e2e.js --runInBand');
