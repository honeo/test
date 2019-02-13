/*
	promiseを返し、callbackの返り値がtrueかtrueを引数にresolveするpromise以外ならRejectする。
	Node.jsっぽければprocessを失敗させる。

	引数
		1: [...function]
		2: object
	返り値
		promise
*/

// Modules
const fs = require('fs');
const fse = require('fs-extra');
const ospath = require('ospath');
const path = require('path');

// Var
const isNodejs = typeof process==='object' && typeof require==='function';
const option_default = {
	chtmpdir: false,
	console: true,
	exit: false,
	init: null,
	tmpdirOrigin: null
}

/*
	本体
		引数
			1: [..function]
				テストするcallback関数の配列
			2: op, object
				option
		返り値
			promise
				テストの成否によってtrueを引数に解決またはerrorを引数に失敗する。
*/
function Test(callbacks, _options={}){
	const options = Object.assign({}, option_default, _options);
	const {
		chtmpdir: isChtmpdir,
		console: isConsole,
		exit: isExit,
		init,
		tmpdirOrigin
	} = options;
	// cwd変更前に絶対パス化
	if( typeof options.tmpdirOrigin==='string' ){
		options.tmpdirOrigin = path.resolve(options.tmpdirOrigin);
	}

	// Validation
	if( !Array.isArray(callbacks) ){
		throw new TypeError(`Invalid arguments 1: ${callbacks}`);
	}
	// 引数1の配列の価が全て関数か
	callbacks.forEach( (callback, index)=>{
		if( typeof callback!=='function'){
			throw new TypeError(`Invalid arguments 1[${index}]: ${callback}`);
		}
	});

	isConsole && console.log(`Test: start`);
	const ms_start = Date.now();
	const str_startCWDPath = process.cwd();
	let str_tempDirPath;

	// options.chtmpdirがあれば、TMPに作業ディレクトリを作って移動する
	if( isChtmpdir===true ){
		str_tempDirPath = fs.mkdtempSync(path.join(ospath.tmp(), 'test-'));
		process.chdir(str_tempDirPath);
	}

	return _Test(callbacks, options).then( ()=>{
		isConsole && console.log(`Test: finished in ${Date.now()-ms_start}ms`);
		// 作業Dirが違えば戻して、一時作業ディレクトリを削除
		if(process.cwd()!==str_startCWDPath){
			process.chdir(str_startCWDPath);
			return fse.remove(str_tempDirPath).then( ()=>{
				return true;
			});
		}else{
			return true;
		}
	}).catch( (error)=>{
		isConsole && console.error(error);
		isConsole && console.error(`Test: failed`);
		// 作業Dirが違えば戻して、一時作業ディレクトリを削除
		if(process.cwd()!==str_startCWDPath){
			process.chdir(str_startCWDPath);
			return fse.remove(str_tempDirPath).then( ()=>{
				if(isExit && isNodejs){
					process.exit(1);
				}else{
					return Promise.reject(error);
				}
			});
		}else{
			if(isExit && isNodejs){
				process.exit(1);
			}else{
				return Promise.reject(error);
			}
		}
	});
}

/*
	callbackを非同期ループするやつ
		引数
			1: [..function]
				テストする関数の配列。
			2: object
				Testから渡される設定オブジェクト
		返り値
			promise
				テストの成否によってtrueを引数に解決するかerrorを引数に失敗する。
*/
async function _Test(callbacks, options){
	for(let [index, func] of callbacks.entries() ){
		options.console && console.log(`case: ${index+1}/${callbacks.length}`);

		// 設定有効時は初期化
		if( typeof options.chtmpdir==='string' ){
			await fse.emptyDir('./');
		}

		// 設定有効時はコピー
		if( typeof options.tmpdirOrigin==='string' ){
			await fse.copy(options.tmpdirOrigin, './', {
				preserveTimestamps: true
			});
		}
		// 初期化関数があれば実行
		if(typeof options.init==='function'){
			await options.init();
		}
		// 値がtrue以外なら失敗
		const result = await func();
		if( result!==true ){
			return Promise.reject(
				new Error(`case ${index+1}/${callbacks.length}: result = ${result}`)
			);
		}
	}
}


module.exports = Test;
