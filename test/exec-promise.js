/*
	execのpromise版
*/

// Modules
const exec = require('child_process').exec;

/*
	引数文字列のコマンドを実行する

	引数
		1: string
	返り値
		promise
*/
function execPromise(command){

	// Validation
	if( typeof command!=='string' ){
		throw new TypeError(`Invalid argument: ${obj}`);
	}

	return new Promise( (resolve, reject)=>{
		exec(command, (error, text, errortext)=>{
			if(error){
				reject(error);
			}else if(text){
				resolve(text);
			}else if(errortext){
				reject(errortext);
			}else{
				reject('No response');
			}
		});
	});
}

module.exports = execPromise;
