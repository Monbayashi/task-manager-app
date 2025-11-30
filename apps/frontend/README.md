# フロントエンド

## 概要

Nextjsの[静的エクスポート](http://nextjs.org/docs/app/guides/single-page-applications#static-export-optional)を使用。

## フォルダ構成

```
.
├── .src/
│   └── ...
├── package.json
└── tsconfig.json
```

## テスト範囲

libの配下のみをテスト。

コンポーネントテストはe2e, カバーする。

## 使用ライブラリ

| ライブラリ名      | バージョン | 説明                   |
| ----------------- | ---------- | ---------------------- |
| next              | 16.0.1     |                        |
| tailwindcss       | ^4         | CSS                    |
| @headlessui/react | ^2.2.9     |                        |
| @heroicons/react  | ^2.2.0     |                        |
| aws-amplify       | ^6.15.7    | aws cognito ライブラリ |
| zustand           | ^5.0.8     | グローバル状態管理     |
| react-hook-form   | ^7.66.0    |                        |

## Z-index 階層設計

| 階層 | 値の目安 | className             | 用途                                                             |
| ---- | -------- | --------------------- | ---------------------------------------------------------------- |
| 1    | 100〜199 | -                     | （ほぼ使わない・廃止層）                                         |
| 2    | 200      | z-sticky              | ※現在未使用 (ホバーボタンやテーブルのヘッダー固定などに使う予定) |
| 3    | 300      | z-header              | header                                                           |
| 4    | 400      | z-model-backdrop      | modal backdrop                                                   |
| 5    | 410      | z-model               | modal 本体                                                       |
| 6    | 500      | z-popover             | popover / dropdown / tooltip / datepicker / select / combobox    |
| 7    | 600      | z-toast               | toast / notification / alert                                     |
| 8    | 999+     | z-skip-link, z-debbug | skip-link / debug                                                |
