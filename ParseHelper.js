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
}
module.exports = new ParseHelper();