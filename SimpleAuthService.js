'use strict'

var AsyncStorage = require('react-native').AsyncStorage
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
var userNameKey = 'userName';
var isAdminKey = 'isAdmin';

class SimpleAuthService {
	authorize(username){
		return new Promise((resolve, reject) =>{
			ParseModule.login( username, (user,isAdmin)=>{
				AsyncStorage.multiSet([[userNameKey, user],
									   [isAdminKey, isAdmin.toString()]],
				(err)=>
				{
					if(err){
						reject(err);
					}
					resolve(isAdmin.toString());
				})
			})
		})
	}
	getAuthInfo(cb){
		AsyncStorage.multiGet([userNameKey, isAdminKey], (err, val) =>{
			if(err){
				return cb();
			}
			if(!val){
				return cb();
			}
			else{
				var zippedObject = _.zipObject(val);
				if (!zippedObject[userNameKey]) {
					return cb();
				};
				return cb(null, zippedObject[userNameKey], zippedObject[isAdminKey] == 'true'? true:false);
			}
		})
	}
}
module.exports = new SimpleAuthService();