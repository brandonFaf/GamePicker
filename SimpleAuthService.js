'use strict'
//pull in modules for device storage and Parse functions and general object helpers
var AsyncStorage = require('react-native').AsyncStorage
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');

//set keys for device storage
var userNameKey = 'userName';
var isAdminKey = 'isAdmin';
var leagueNameKey = 'leagueName';

class SimpleAuthService {
	//authorize function to log user in 
	authorize(username, league){
		//return a promise to allow promise chaining
		return new Promise((resolve, reject) =>{
			//call login function from parse helper
			 ParseModule.login( username, league, (user,isAdmin)=>{
			//ParseModule.loginEmail(league, (user,isAdmin)=>{
				//store username, isAdmin, and league on the device
				AsyncStorage.multiSet([[userNameKey, user],
									   [isAdminKey, isAdmin.toString()],
									   [leagueNameKey, league]],
				//callback function for AsyncStorage set
				(err)=>
				{

					if(err){
						reject(err);
					}
					//send object with user info
					resolve({isAdmin, username, league});
				})
			})
		})
	}
	//check device for user info which means they have logged in before
	getAuthInfo(cb){
		//get info with keys
		AsyncStorage.multiGet([userNameKey, isAdminKey, leagueNameKey], (err, val) =>{
			if(err){
				return cb();
			}
			//if no values, return nothing
			if(!val){
				return cb();
			}
			else{
				//unzip the val object to get to all the keys
				var zippedObject = _.zipObject(val);
				//if username is blank then no user so return nothing
				if (!zippedObject[userNameKey]) {
					return cb();
				};
				//otherwise return no error and each piece of the user data. 
				return cb(null, zippedObject[userNameKey], zippedObject[isAdminKey] == 'true'? true:false, zippedObject[leagueNameKey]);
			}
		})
	}
}
module.exports = new SimpleAuthService();