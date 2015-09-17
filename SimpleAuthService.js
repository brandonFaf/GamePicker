'use strict'

var AsyncStorage = require('react-native').AsyncStorage
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
var userNameKey = 'userName';
var isAdminKey = 'isAdmin';
var leagueNameKey = 'leagueName';

class SimpleAuthService {
	authorize(username, league){
		return new Promise((resolve, reject) =>{
			 ParseModule.login( username, league, (user,isAdmin)=>{
			//ParseModule.loginJonny(league, (user,isAdmin)=>{
				AsyncStorage.multiSet([[userNameKey, user],
									   [isAdminKey, isAdmin.toString()],
									   [leagueNameKey, league]],
				(err)=>
				{
					if(err){
						reject(err);
					}
					resolve({isAdmin, username, league});
				})
			})
		})
	}
	getAuthInfo(cb){
		AsyncStorage.multiGet([userNameKey, isAdminKey, leagueNameKey], (err, val) =>{
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
				return cb(null, zippedObject[userNameKey], zippedObject[isAdminKey] == 'true'? true:false, zippedObject[leagueNameKey]);
			}
		})
	}
}
module.exports = new SimpleAuthService();