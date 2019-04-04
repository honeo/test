/*
	Test
		自身で確認するのは全然だめなのでは。
*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const fs = require('fs');
const path = require('path');
const Test = require('../');
const execPromise = require('./exec-promise.js');
const ospath = require('ospath');

// Var
const option = {
	exit: true,
	debug: true
}


/*
	Main
*/

Test([function(){
	// 同期、成功
	return Test([function(){
		return true;
	}], {
		console: false,
		exit: true,
		prefix: 'Sub-1'
	});
}, function(){
	// 同期、失敗なら成功
	return Test([function(){
		return false;
	}], {
		console: false,
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
		console: false,
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
		console: false,
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
}, function(){
	// option.init
	let flg = false;
	return Test([function(){
		return flg;
	}], {
		console: false,
		exit: false,
		init(){
			flg = true;
		},
		prefix: 'Sub-5'
	});
}, async function(){
	// option.chtmpdir
	const path_cd_before = process.cwd();
	const bool = await Test([function(){
		const path_cd = process.cwd();
		return path_cd.includes(ospath.tmp()) && /test/.test(path_cd) && fs.existsSync(path_cd);
	}], {
		chtmpdir: true,
		console: false,
		exit: false,
		prefix: 'Sub-6'
	});
	const path_cd_after = process.cwd();
	return bool && path_cd_before===path_cd_after;
}, function(){
	// option.tmpdirOrigin
	return Test([function(){
		return fs.existsSync('hoge.txt');
	}], {
		chtmpdir: true,
		console: false,
		exit: false,
		prefix: 'Sub-7',
		tmpdirOrigin: 'tmpdirOrigin'
	});
}], option);
