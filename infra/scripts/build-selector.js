const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// パスの定義
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// 環境変数の定義
const ENV_VARS = {
  NEXT_PUBLIC_API_URL: "https://joji-monbayashi.click",
  NEXT_PUBLIC_APP_URL: "https://joji-monbayashi.click/",
  NEXT_PUBLIC_COGNITO_POOL_ID: "ap-northeast-1_MD7zqiZga",
  NEXT_PUBLIC_COGNITO_CLIENT_ID: "7oa3l9iv02dr6vv6du8b0aqehm",
  NEXT_PUBLIC_DOMAIN:
    "ap-northeast-1md7zqizga.auth.ap-northeast-1.amazoncognito.com",
};

// 設定定数
const isWindows = process.platform === "win32";
const dockerFile = "Dockerfile.builder-frontend";
const tagName = "frontend-builder";
const localOutPath = path.join(PROJECT_ROOT, "apps", "frontend", "out");
const localFrontAppPath = path.join(PROJECT_ROOT, "apps", "frontend");

// Docker Build コマンド
const dockerArgs = Object.entries(ENV_VARS)
  .map(([key, value]) => `--build-arg ${key}=${value}`)
  .join(" ");
const dockerBuildCommand = `docker build ${dockerArgs} -f ${path.join(PROJECT_ROOT, dockerFile)} -t ${tagName} ${PROJECT_ROOT}`;

// 実行関数
function runBuild() {
  console.log(`\n Build-Selector 起動 (OS: ${process.platform})`);

  try {
    if (isWindows) {
      console.log(`Windows用 ビルド処理`);

      // Docker Build を実行 (CWD: ルート)
      execSync(dockerBuildCommand, { stdio: "inherit" });
      // apps/frontend/outのフォルダーを作成
      if (fs.existsSync(localOutPath)) {
        fs.rmSync(localOutPath, { recursive: true, force: true });
      }
      fs.mkdirSync(localOutPath, { recursive: true });

      // イメージからビルドフォルダ取得
      const tempContainerName = "temp-copy-" + Date.now();
      execSync(`docker create --name ${tempContainerName} ${tagName} /bin/sh`, {
        stdio: "inherit",
      });
      execSync(
        `docker cp ${tempContainerName}:/out_artifact/. ${localOutPath}`,
        { stdio: "inherit" }
      );
      execSync(`docker rm ${tempContainerName}`, { stdio: "inherit" });

      console.log("WindowsS用 ビルド処理 正常終了");
    } else {
      console.log("Linux/macOS/CI用 ビルド処理");
      // 環境変数を設定し、pnpm build を実行
      const envVarsString = Object.entries(ENV_VARS)
        .map(([key, value]) => `${key}='${value}'`)
        .join(" ");
      const localBuildCommand = `${envVarsString} pnpm --filter=frontend... build`;

      // 実行コンテキストを apps/frontend に指定して実行
      execSync(localBuildCommand, {
        stdio: "inherit",
        cwd: localFrontAppPath,
      });

      console.log("Linux/macOS/CI用 ビルド処理 正常終了");
    }
  } catch (error) {
    console.error(`   > 実行に失敗しました。詳細:`);
    console.error(`   > ${error.message}`);
    console.error(`   > -----------------------------------`);
    console.error(`\n  Build-Selector 失敗 (OS: ${process.platform})`);
    process.exit(1);
  }
}

runBuild();
