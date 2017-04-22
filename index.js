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
const fsp = require('fs-promise');
const ospath = require('ospath');
const path = require('path');

// Var
const isNodejs = typeof process==='object' && typeof require==='function';

/*
	本体
*/
function Test(callbacks, option={}){
	const chtmpdir = option.chtmpdir || false;
	const isConsole = option.console || true;
	const exit = option.exit || false;
	const init = option.init;

	/// Validation
	// 引数1が配列か
	if( !Array.isArray(callbacks) ){
		throw new TypeError(`Invalid arguments[0]: ${callbacks}`);
	}
	// 引数1の配列の価が全て関数か
	callbacks.forEach( (callback, index)=>{
		if( typeof callback!=='function'){
			throw new TypeError(`Invalid arguments[0][${index}]: ${callback}`);
		}
	});

	isConsole && console.log(`Test: start`);
	const ms_start = Date.now();
	const cd_start = process.cwd();
	let path_tempDir;

	// option.chtmpdirがあれば、TMPに作業ディレクトリを作って移動する
	if( chtmpdir===true ){
		path_tempDir = fs.mkdtempSync(path.join(ospath.tmp(), 'test-'));
		process.chdir(path_tempDir);
	}

	return _Test(callbacks, {isConsole, init}).then( ()=>{
		isConsole && console.log(`Test: finished in ${Date.now()-ms_start}ms`);
		// 作業Dirが違えば戻して、一時作業ディレクトリを削除
		if(process.cwd()!==cd_start){
			process.chdir(cd_start);
			return fsp.remove(path_tempDir).then( ()=>{
				return true;
			});
		}else{
			return true;
		}
	}).catch( (error)=>{
		isConsole && console.error(error);
		isConsole && console.error(`Test: failed`);
		// 作業Dirが違えば戻して、一時作業ディレクトリを削除
		if(process.cwd()!==cd_start){
			process.chdir(cd_start);
			fsp.removeSync(path_tempDir);
		}
		if(exit && isNodejs){
			process.exit(1);
		}else{
			return Promise.reject(error);
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
async function _Test(callbacks, {isConsole, init}){
	for(let [index, func] of callbacks.entries() ){
		isConsole && console.log(`case: ${index+1}/${callbacks.length}`);
		// 初期化関数があれば実行
		if(typeof init==='function'){
			await init();
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
