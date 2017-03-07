/*
	Test
[*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const Test = require('../');
const execPromise = require('./exec-promise.js');

// Main
Test([function(){
	// 同期、成功
	return Test([function(){
		return true;
	}], {
		exit: true,
		prefix: 'Sub-1'
	});
}, function(){
	// 同期、失敗なら成功
	return Test([function(){
		return false;
	}], {
		exit: false,
		prefix: 'Sub-2'
	}).then( (arg)=>{
		return false;
	}).catch( (error)=>{
		return true;
	});
}, function(){
	// 非同期、成功
	return Test([function(){
		return new Promise( (resolve, reject)=>{
		    setTimeout(resolve, 100, true);
		});
	}], {
		exit: false,
		prefix: 'Sub-3'
	});
}, function(){
	// 非同期、失敗なら成功
	return Test([function(){
		return new Promise( (resolve, reject)=>{
		    setTimeout(reject, 100);
		}).then( (arg)=>{
			return false;
		}).catch( (error)=>{
			return true;
		});
	}], {
		exit: false,
		prefix: 'Sub-4'
	});
}, function(){
	// CLI 失敗してTestがexitできていれば成功
	return execPromise('npm run test-case-failed').then( (arg)=>{
		console.log(arg);
		return false;
	}).catch( (error)=>{
		return error.message.includes('Exit status 1');
	});
}], {
	exit: true,
	prefix: 'Main'
});
