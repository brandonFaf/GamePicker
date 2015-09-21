//require ObjC parse module
var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
class ParseHelper {
	//query a specific parse class, provide a where condition, specify if the query should use the local datastore, and columns to return.
	parseQuery(classLookup, whereColumn, equalsValue, fromLocal, columns){
		//return Promise for promise chaining
		return new Promise((resolve,reject)=>{
			var returnArray = [];
			//call query method from parse module
			ParseModule.queryClass(classLookup,whereColumn,equalsValue, fromLocal, columns, (results) =>{
				//add objectID key to the front of the columns list
				columns.unshift('objectID');
				//zip the colums and values up
				results.forEach((n,i) =>{
					returnArray.push(_.zipObject(columns,n));
				});
				//return the results
				resolve(returnArray);
			});
		})
	}

	//save the users selection
	saveSelection(objectID, selectionId, selection, isDouble, cb){
		//call saveSelection method from parse module
		ParseModule.saveSelection(objectID, selectionId, selection, isDouble, (savedId)=>{
			//return the ID and the selection
			cb(savedId,selection)
		})
	}
	//update the schedule if required
	updateSchedule(cb){
		//call updateSchedule method from Parse module
		ParseModule.updateSchedule((result)=>cb(result));
	}

	//save the result of a game (aka. the winner)
	saveResult(objectID,selection,cb){
		//call saveResult method from Parse module
		ParseModule.saveResult(objectID,selection,cb(0,selection));
	}
	//get the score for the user for a certain week
	getScoreForCurrentUser(week){
		//return promise for promise chaining
		return new Promise((resolve, reject)=>{
			//call getScoreForCurrentUser method from parse module, return the result
			ParseModule.getScoreForCurrentUser(week, ()=>cb(1), result=>resolve(result));
		})
	}
	//get the scores for each users in a league
	getAllScores(league){
		return new Promise((resolve, reject)=>{
			//call getAllScoresForLeague method from parse module, return the result
			ParseModule.getAllScoresForLeague(league, (...results)=>resolve(results));
		});
	}
	//check if a double has been used before by the user
	checkIfDoubleIsLegal(teamName){
		return new Promise((resolve,reject) => {
			//call method from parse module, return "continue" if good, nothing if not
			ParseModule.checkIfDoubleIsLegal(teamName,cont=>resolve(cont))
		});
	}
	//add or remove team from the users double array
	changeDoubleArray(shouldAdd,teamName){
		return new Promise((resolve,reject) =>{
			//call method from parse module
			ParseModule.changeDoubleArray(shouldAdd,teamName, (result)=>resolve())
		})
	}
	//set the selection as a double
	setDouble(week,sectionId){
		return new Promise((resolve,reject)=>{
			//call method from parse module
			ParseModule.setDouble(week,sectionId,(result)=>resolve());
		})
	}
	//get the selections of other users in the league
	getOthersPicks(gameId, league){
		return new Promise((resolve,reject)=>{
			//call method from parse module, return picks object
			ParseModule.getOthersPicks(gameId,league,(results) => resolve(results));
		})
	}
}
module.exports = new ParseHelper();