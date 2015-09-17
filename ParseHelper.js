var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
class ParseHelper {
	parseQuery(classLookup, whereColumn, equalsValue, fromLocal, columns){
		return new Promise((resolve,reject)=>{
			var returnArray = [];
			ParseModule.queryClass(classLookup,whereColumn,equalsValue, fromLocal, columns, (results) =>{
				columns.unshift('objectID');
				results.forEach((n,i) =>{
					returnArray.push(_.zipObject(columns,n));
				});
				resolve(returnArray);
			});
		})
	}
	saveSelection(objectID, selectionId, selection, isDouble, cb){
		ParseModule.saveSelection(objectID, selectionId, selection, isDouble, (savedId)=>{
			cb(savedId,selection)
		})
	}
	updateSchedule(cb){
		ParseModule.updateSchedule((result)=>cb(result));
	}
	saveResult(objectID,selection,cb){
		ParseModule.saveResult(objectID,selection,cb(0,selection));
	}
	getScoreForCurrentUser(week){
		return new Promise((resolve, reject)=>{
			ParseModule.getScoreForCurrentUser(week, ()=>cb(1), result=>resolve(result));
		})
	}
	getAllScores(league){
		return new Promise((resolve, reject)=>{
			ParseModule.getAllScoresForLeague(league, (...results)=>resolve(results));
		});
	}
	checkIfDoubleIsLegal(teamName){
		return new Promise((resolve,reject) => {
			ParseModule.checkIfDoubleIsLegal(teamName,cont=>resolve(cont))
		});
	}
	changeDoubleArray(shouldAdd,teamName){
		return new Promise((resolve,reject) =>{
			ParseModule.changeDoubleArray(shouldAdd,teamName, (result)=>resolve())
		})
	}
	setDouble(week,sectionId){
		return new Promise((resolve,reject)=>{
			ParseModule.setDouble(week,sectionId,(result)=>resolve());
		})
	}
	getOthersPicks(gameId, league){
		return new Promise((resolve,reject)=>{
			ParseModule.getOthersPicks(gameId,league,(results) => resolve(results));
		})
	}
}
module.exports = new ParseHelper();