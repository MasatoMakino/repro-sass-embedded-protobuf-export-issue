# @bufbuild/protobuf v2.0.0–v2.4.0 で `ERR_PACKAGE_PATH_NOT_EXPORTED` が発生する

## 概要

sass-embedded v1.89.1が依存している `@bufbuild/protobuf` をv2.0.0～v2.4.0の範囲でインストールすると、Sassのコンパイル時に次のエラーが発生します。

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]:
Package subpath './codegenv2' is not defined by "exports"
 in node_modules/sass-embedded/node_modules/@bufbuild/protobuf/package.json
```

## 再現手順

1. 空ディレクトリを作成  
2. `npm init -y`  
3. `npm install sass-embedded@1.89.1`  
4. `package.json` に以下を追加し、sass-embeddedが許容するバージョン範囲（^2.0.0）内で`@bufbuild/protobuf`を特定バージョンに固定  
   ```json
   "overrides": {
     "@bufbuild/protobuf": "2.0.0"
   }
   ```
5. `input.scss` を準備  
   ```scss
   $primary-color: #333;
   .example { color: $primary-color; }
   ```
6. `index.js` で次を呼び出し  
   ```js
   import { compileAsync } from 'sass-embedded';
   const result = await compileAsync("input.scss");
   console.log(result.css.toString());
   ```
7. `node index.js` を実行  

## 動作確認済みの組み合わせ

- sass-embedded@1.89.0 + @bufbuild/protobuf@2.0.0 → エラーなし  
- sass-embedded@1.89.1 + @bufbuild/protobuf@2.0.0～2.4.0 → `ERR_PACKAGE_PATH_NOT_EXPORTED`  
- sass-embedded@1.89.1 + @bufbuild/protobuf@2.5.0 → エラーなし  

## 原因

- `@bufbuild/protobuf@2.4.0` 以下の配布品では `exports` マップに `./codegenv2` が存在せず、  
  `require('@bufbuild/protobuf/codegenv2')` が失敗する  
- v2.5.0では `exports` に以下が追加され、解消されている  
  ```diff
  "exports": {
    ".": { … },
    "./codegenv1": { … },
  + "./codegenv2": {
  +   "import": "./dist/esm/codegenv2/index.js",
  +   "require": "./dist/cjs/codegenv2/index.js"
  + },
    "./reflect": { … },
    …
  }
  ```

## 期待される挙動

- sass-embeddedをどのような方法でインストールしても常にSassのコンパイルが成功すること

## 環境

- macOS 14.6.1 (23G93)  
- Node.js 22.15.0  
- sass-embedded@1.89.1  
- @bufbuild/protobuf@2.0.0～2.4.0で再現  
- @bufbuild/protobuf@2.5.0では問題なし

## 発生条件

- 通常の `npm install` では、`sass-embedded@1.89.1` の依存範囲 `^2.0.0` に従い、最新のv2系（v2.5.2）がインストールされるため問題は発生しません。
- Dependabot等の自動更新ツールが `package-lock.json` を尊重し、すでにlockされている `@bufbuild/protobuf@2.4.0` を維持したまま更新を行うと、本問題が再現します。

## 修正案

- `sass-embedded` の `package.json` 内で `@bufbuild/protobuf` の依存範囲を `^2.5.0` に変更し、2.0.0～2.4.0のバージョンを避ける。
