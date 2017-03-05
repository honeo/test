/*
	Test
[*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const Test = require('../');

// Var
let count = 0;
const option = {
	exit: false
}
const cases = [];

// 成功例
Test([function(){
	return true;
}, function(){
	return new Promise( (resolve, reject)=>{
	   setTimeout(resolve, 300);
	});
}], option).then( (arg)=>{
	console.log('then1');
	count++;
	// 失敗例
	return new Promise( (resolve, reject)=>{
		Test([function(){
			return false;
		}], option).catch(resolve);
	});
}).then( (arg)=>{
	console.log('then2');
	count++;
	// 失敗例・非同期
	return new Promise( (resolve, reject)=>{
		Test([function(){
			return new Promise( (resolve, reject)=>{
				setTimeout(reject, 300, new Error('rejected'));
			});
		}], option).catch(resolve);
	});
}).then( (arg)=>{
	console.log('then3');
	count++;
	// 失敗例、syntax error
	return new Promise( (resolve, reject)=>{
		Test([function(){
			return hoge;
		}], option).catch(resolve);
	});
}).then( (arg)=>{
	count++;
	const isSuccess = count===4;
	if(isSuccess){
		console.log('test/test finished');
	}else{
		return Promise.reject(new Error(`count: ${count}`));
	}
});
