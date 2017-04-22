# document
いわゆる製作メモ。

## TODO
* option.console
 * コンソール表示有無のboolean
 * テストは前後の標準出力の確認で。
* v4
 * Test('testname', callback); として一つがコケてもすべて完走するまで回す。
 * 一つ一つに掛かった時間と、失敗したcallbackもリストアップする。


## コンセプト
* シンプル動作

## Callback内非同期処理で発生した例外の捕捉について
(ヾﾉ･ω･`)ﾑﾘﾑﾘ

## 依存モジュール
* fs-promise
 * 作業用ディレクトリの作成など。
* ospath
 * TMPディレクトリパス取得用。
