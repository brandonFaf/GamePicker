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
	saveSelection(objectID, selection, cb){
		ParseModule.saveSelection(objectID,selection, () =>{cb()})
	}
	updateSchedule(cb){
		ParseModule.updateSchedule((result)=>cb(result));
	}
}
module.exports = new ParseHelper();