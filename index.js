/*
	本体
		promiseを返し、callbackの返り値がtrueかtrueを引数にresolveするpromise以外ならRejectする。
		Node.jsっぽければprocessを失敗させる。
	引数
		1: [...function]
		2: object
	返り値
		promise
*/

// Modules
const fsp = require('fs-promise');
const ospath = require('ospath');
const path = require('path');

// Var
const isNodejs = typeof process==='object' && typeof require==='function';

/*
	本体
*/
function Test(callbacks, {chtmpdir=false, exit=true, init, prefix=''}){

	// あればタブ揃えする
	const _prefix = typeof prefix==='string' && prefix.length ?
		`${prefix}\t`:
		``;

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

	console.log(`${_prefix}Test: start`);
	const ms_start = Date.now();
	const cd_start = process.cwd();
	let path_tempDir;

	// option.chtmpdirがあればTMPに作業ディレクトリを作る
	if( chtmpdir===true ){
		process.chdir(ospath.tmp());
		const tempDirName = fsp.mkdtempSync('test');
		path_tempDir = path.resolve('./', tempDirName);
		process.chdir(path_tempDir);
	}


	return _Test(callbacks, {exit, init, prefix: _prefix}).then( ()=>{
		console.log(`${_prefix}Test: finished in ${Date.now()-ms_start}ms`);
		// 開始時のcdに戻して一時作業ディレクトリを削除
		if(chtmpdir===true){
			process.chdir(cd_start);
			fsp.removeSync(path_tempDir);
		}
		return true;
	}).catch( (error)=>{
		console.error(error);
		console.error(`${_prefix}Test: failed`);
		// 開始時のcdに戻して一時作業ディレクトリを削除
		if(chtmpdir===true){
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
*/
async function _Test(callbacks, {exit, prefix, init}){
	for(let [index, func] of callbacks.entries() ){
		console.log(`${prefix}case: ${index+1}/${callbacks.length}`)
		// 初期化関数があれば実行
		if(typeof init==='function'){
			await init();
		}
		// 値がtrue以外なら失敗
		const result = await func();
		if( result!==true ){
			return Promise.reject(
				new Error(`${prefix}case ${index+1}/${callbacks.length}: result = ${result}`)
			);
		}
	}
}

module.exports = Test;
