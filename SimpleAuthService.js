'use strict'

var AuthWrapper = require('NativeModules').AuthWrapper
var AsyncStorage = require('react-native').AsyncStorage
var ParseModule = require('NativeModules').ParseModule
class SimpleAuthService {
	authorize(){
		return new Promise((resolve, reject) =>{
			ParseModule.login((user)=>{
				AsyncStorage.setItem('userName', user,(err)=>
				{
					if(err){
						reject(err);
					}
					resolve(user);
				})
			})
		})
	}
	getAuthInfo(cb){
		AsyncStorage.getItem('userName', (err, val) =>{
			if(err){
				return cb();
			}
			if(!val){
				return cb();
			}
			else{
				return cb(null, val);
			}
		})
	}
}
module.exports = new SimpleAuthService();