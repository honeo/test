/*
	本体
		promiseを返し、callbackの返り値がtrueかresolveするpromise以外ならRejectする。
		Node.jsっぽければprocessを失敗させる。
	引数
		1: [...function]
		2: object
	返り値
		promise

*/
let isNodejs;
try{
	isNodejs = typeof process.exit==='function';
}catch(e){
	isNodejs = false;
}

/*
	本体
*/
function Test(callbacks, option={}){

	// 何故かdefault引数に含むとexitが参照できなくなる
	const isExit = option.exit===true;

	// Validation
	if( !Array.isArray(callbacks) ){
		throw new TypeError(`Invalid arguments[0]: ${callbacks}`);
	}
	callbacks.forEach( (callback, index)=>{
		if( typeof callback!=='function'){
			throw new TypeError(`Invalid arguments[0][${index}]: ${callback}`);
		}
	});

	console.log('Test: start');
	const ms_start = Date.now();
	return _Test(callbacks).then( ()=>{
		console.log(`Test: finished in ${Date.now()-ms_start}ms`);
	}).catch( (error)=>{
		console.log(`Test: failed`, error);
		if(isExit && isNodejs){
			process.exit(1);
		}else{
			return Promise.reject(error);
		}
	});
}

/*
	callbackを非同期ループするやつ
*/
async function _Test(callbacks){
	for(let [index, func] of callbacks.entries() ){
		console.log(`case: ${index+1}/${callbacks.length}`)

		let result;
		try{
			result = func();
		}catch(e){
			throw new Error(`callback[${index}] failed\n${e}`);
		}

		// 返り値がpromiseなら解決した値に置きかえる
		if(result instanceof Promise){
			const arg = await result.then( (arg)=>{
				return arg;
			}).catch( (error)=>{
				throw error;
			});
		}else{
			// 値がtrue以外なら失敗
			if( result!==true ){
				throw new Error(`callback[${index}] result = ${result}`);
			}
		}
	}
}

module.exports = Test;
