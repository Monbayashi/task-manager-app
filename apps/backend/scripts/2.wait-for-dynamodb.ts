import axios from 'axios';

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** DynamoDB サービスの起動を待ち */
async function main() {
  console.log('DynamoDB サービスの起動を待っています...');
  const maxRetries = 60; // 最大リトライ回数
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const res = await axios.get('http://localhost:4567/_localstack/health');
      const dynamoStatus = res.data?.services?.dynamodb;
      if (dynamoStatus === 'available') {
        console.log('DynamoDB 起動済み!');
        return;
      }
      console.log('DynamoDB はまだ準備できていません…再試行します');
    } catch {
      console.log('ヘルスチェックに失敗しました…再試行します');
    }
    retries++;
    await sleep(2000); // 2秒待機
  }

  console.error(`DynamoDB did not start after ${maxRetries} retries (~${maxRetries * 2} sec)`);
  process.exit(1); // 強制終了
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
