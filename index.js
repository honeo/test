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
const fse = require('fs-extra');
const ospath = require('ospath');
const path = require('path');

// Var
const isNodejs = typeof process==='object' && typeof require==='function';
const obj_defaultOptions = {
	chtmpdir: false,
	console: true,
	debug: false,
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
	const options = {...obj_defaultOptions, ..._options}

	options.debug && console.log(options);

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
	// options.prop
	if( typeof options.debug!=='boolean' ){
		throw new TypeError(`Invalid arguments 2: options {debug: ${options.debug}}`);
	}


	options.console && console.log(`Test: start`);
	const num_startMs = Date.now();
	options.debug && console.log('startMs:', num_startMs);

	const str_startCWDPath = process.cwd();
	options.debug && console.log('startCWDPath:', str_startCWDPath);

	let str_tempDirPath;

	// 有効時、TMPに作業ディレクトリを作って移動
	if( options.chtmpdir===true ){

		str_tempDirPath = fse.mkdtempSync(
			path.join(ospath.tmp(), 'test-')
		);

		options.debug && console.log('CWD change');
		options.debug && console.log('current:', str_startCWDPath);
		options.debug && console.log('move to:', str_tempDirPath);

		process.chdir(str_tempDirPath);
	}

	return _Test(callbacks, options).then( ()=>{
		options.console && console.log(
			`Test: finished in ${Date.now()-num_startMs}ms`
		);
		return true;
	}).catch( (error)=>{
		options.console && console.error(error);
		options.console && console.error(`Test: failed`);

		if(options.exit && isNodejs){
			process.exit(1);
		}
		return Promise.reject(error);
	}).finally( async ()=>{
		options.console && console.groupEnd();
		// 作業Dirが違えば戻して、一時作業ディレクトリを削除
		const str_cdPath = process.cwd();
		if(str_cdPath!==str_startCWDPath){
			options.debug && console.log('CWD return');
			options.debug && console.log('current:', str_cdPath);
			options.debug && console.log('move to:', str_startCWDPath);

			process.chdir(str_startCWDPath);
			await fse.remove(str_tempDirPath);
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
		if( options.chtmpdir===true ){
			options.debug && console.log('directory clear');
			await fse.emptyDir('./');
		}

		// 設定有効時はコピー
		if( typeof options.tmpdirOrigin==='string' ){
			options.debug && console.log('origin copy');
			await fse.copy(options.tmpdirOrigin, './', {
				preserveTimestamps: true
			});
		}
		// 初期化関数があれば実行
		if(typeof options.init==='function'){
			options.debug && console.log('init');
			await options.init();
		}
		// 値がtrue以外なら失敗
		const result = await func();
		options.debug && console.log(`result:`, result);
		if( result!==true ){
			return Promise.reject(
				new Error(`case ${index+1}/${callbacks.length}: result = ${result}`)
			);
		}
	}
}


module.exports = Test;
