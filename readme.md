# test
* [honeo/test](https://github.com/honeo/test)  
* [@honeo/test](https://www.npmjs.com/package/@honeo/test)


## なにこれ
かんたんテストモジュール。


## 使い方
```sh
$ npm i -D @honeo/test
```
```js
const Test = require('@honeo/test');

await Test([function(){
	return true;
}, function(){
	return new Promise( (resolve, reject)=>{
	    setTimeout(resolve, 1000, true);
	});
}], {
	console: true
});
```


## API

### Test([..callback] [, options])
引数1配列内の関数を失敗するまで順に実行する。  
全ての関数が成功したら解決するpromiseを返す。

#### 成否判定
callbackの返り値が以下の場合は成功とする。
* true
* promise{[[state]]: "fulfilled", [[value]]: true}

#### options
| key          | type     | default | description                                                            |
|:------------ |:-------- | ------- | ---------------------------------------------------------------------- |
| chtmpdir     | boolean  | false   | trueなら一時作業ディレクトリを作り、初期化してからinit・テスト関数を実行する。 |
| console      | boolean  | true    | Console表示の有無。                                                    |
| exit         | boolean  | false   | 実行環境がNode.jsならテスト失敗時にプロセスも失敗させる。              |
| init         | function | null    | 各テスト関数前に実行する初期化用関数。promiseが返れば解決まで待つ。    |
| tmpdirOrigin | string   | null    | 各テスト開始時、実行ディレクトリに中身をコピーするディレクトリのパス。   |
