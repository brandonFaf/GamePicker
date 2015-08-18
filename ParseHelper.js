var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
class ParseHelper {
	parseQuery(classLookup, whereColumn, equalsValue, fromLocal, columns, cb){
		var returnArray = [];
		ParseModule.queryClass(classLookup,whereColumn,equalsValue, fromLocal, columns, (results) =>{
			columns.unshift('objectID');
			results.forEach((n,i) =>{
				returnArray.push(_.zipObject(columns,n));
			});
			cb(returnArray);
		});
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
		ParseModule.saveResult(objectID,selection,cb(selection));
	}
	getScoreForCurrentUser(week,cb){
		ParseModule.getScoreForCurrentUser(week, ()=>cb(1), result=>cb(result));
	}
	getAllScores(cb){
		ParseModule.getAllScores((...results)=>cb(results));
	}
	checkIfDoubleIsLegal(teamName,cb){
		ParseModule.checkIfDoubleIsLegal(teamName,cont=>cb(cont));
	}
	changeDoubleArray(shouldAdd,teamName,cb){
		ParseModule.changeDoubleArray(shouldAdd,teamName, (result)=>cb())
	}
	setDouble(week,sectionId, cb){
		ParseModule.setDouble(week,sectionId,(result)=>cb());
	}
}
module.exports = new ParseHelper();