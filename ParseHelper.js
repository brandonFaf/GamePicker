var ParseModule = require('NativeModules').ParseModule
var _ = require('lodash');
class ParseHelper {
	parseQuery(classLookup, whereColumn, equalsValue, columns, cb){
		var returnArray = [];
		ParseModule.queryClass(classLookup,whereColumn,equalsValue,columns, (results) =>{
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
}
module.exports = new ParseHelper();