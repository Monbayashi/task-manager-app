/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // 文の末尾にセミコロンを付ける
  semi: true,
  // 文字列はシングルクォートで囲む（例: 'text'）
  singleQuote: true,
  // JSX内ではダブルクォートを使用（例: <div className="foo" />）
  jsxSingleQuote: false,
  // 末尾のカンマの扱い: ES5構文に準拠（オブジェクト、配列などに付与）
  trailingComma: "es5",
  // インデントのスペース数
  tabWidth: 2,
  // インデントにタブではなくスペースを使用
  useTabs: false,
  // 1行あたりの最大文字数
  printWidth: 150,
  // オブジェクトリテラルの括弧の間にスペースを入れる（例: { foo: bar }）
  bracketSpacing: true,
  // アロー関数の引数が1つでも必ず括弧を付ける（例: (x) => x）
  arrowParens: "always",
  // 改行コードをLF（Unix形式）に統一
  endOfLine: "auto",
  // プロパティのクォートは必要な場合のみ付ける（例: { foo: 'bar' }）
  quoteProps: "as-needed",
  // 埋め込み言語（例: Markdown内のコードブロック）は自動整形
  embeddedLanguageFormatting: "auto",

  //　MDファイル用設定
  overrides: [
    {
      files: "*.md",
      options: {
        proseWrap: "always",
        printWidth: 150,
      },
    },
  ],
};

export default config;
