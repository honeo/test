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
	prefix: 'example'
});
```

## API

### Test([..callback] [, option])
引数配列内の関数を失敗するまで順に実行する。  
promiseを返す。

#### 成否判定
callbackの返り値が……。
* 成功
 * true, promise{[[state]]: "fulfilled", [[value]]: true}
* 失敗
 * その他

#### option
```js
Test([..callback], {
	exit: true, // default, Node.jsならrejected時にプロセスも失敗させる。
	prefix: '' // console.method(prefix+text);
});
```
