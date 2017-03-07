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

// Var
let isNodejs = typeof process==='object' && typeof require==='function';

/*
	本体
*/
function Test(callbacks, {exit=true, prefix=''}){

	// あればタブ揃えする
	const _prefix = prefix.length ?
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

	return _Test(callbacks, {exit, prefix: _prefix}).then( ()=>{
		console.log(`${_prefix}Test: finished in ${Date.now()-ms_start}ms`);
		return true;
	}).catch( (error)=>{
		console.error(error);
		console.error(`${_prefix}Test: failed`);
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
async function _Test(callbacks, {exit, prefix}){
	for(let [index, func] of callbacks.entries() ){
		console.log(`${prefix}case: ${index+1}/${callbacks.length}`)

		// 値がtrue以外なら失敗
		const result = await func();
		if( result!==true ){
			throw new Error(`callback[${index}] result = ${result}`);
		}
	}
}

module.exports = Test;
