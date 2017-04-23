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

const promise = Test([function(){
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

### Test([..callback] [, option])
引数配列内の関数を失敗するまで順に実行する。  
promiseを返す。

#### 成否判定
callbackの返り値が以下の場合は成功とする。
* true
* promise{[[state]]: "fulfilled", [[value]]: true}

#### option

|   key    |   type   | default |                              description                               |
|:-------- |:-------- | ------- | ---------------------------------------------------------------------- |
| chtmpdir | boolean  | false   | trueなら一時作業ディレクトリを作り、そこでinitやテスト関数を実行する。 |
| console  | boolean  | true    | Console表示の有無。                                                    |
| exit     | boolean  | false   | 実行環境がNode.jsならテスト失敗時にプロセスも失敗させる。              |
| init     | function |   null      | 各テスト関数前に実行する初期化用関数。                                 |
