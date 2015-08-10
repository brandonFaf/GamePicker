
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("getScoreForUser", function(request, response) {
	var Game = Parse.Object.extend("Games");
    var gameQuery = new Parse.Query(Game);
    if (request.params.week != 0) {
        gameQuery.equalTo("Week",request.params.week);
    };
	var Selection = Parse.Object.extend("Selections");
	var selectionQuery = new Parse.Query(Selection);
	var user = new Parse.User();
	user.id  = request.params.user;
	selectionQuery.equalTo("User", user);
	selectionQuery.include("Game");
	selectionQuery.matchesQuery("Game",gameQuery);
	selectionQuery.find({
		success:function(results){
			var count = 0;
			results.forEach(function(n,i){
				
				var winner = n.get("Game").get("Winner");
				var selection = n.get("Selection");
				if (winner == selection) {
					count++
				};
			})
			response.success(count);
		}
	})
});
Parse.Cloud.define("getAllScores", function(request, response) {
	var userQuery = new Parse.Query(Parse.User);
	var scores = [];
	var count=0;
	userQuery.each(function(result){
		var promise = new Parse.Promise.as();
		promise = promise.then(function(){
			var Game = Parse.Object.extend("Games");
		    var gameQuery = new Parse.Query(Game);
		    if (request.params.week != 0) {
		        gameQuery.equalTo("Week",request.params.week);
		    };
			var Selection = Parse.Object.extend("Selections");
			var selectionQuery = new Parse.Query(Selection);
			selectionQuery.equalTo("User", result);
			selectionQuery.include("Game");
			selectionQuery.matchesQuery("Game",gameQuery);
			return selectionQuery.find({
				success:function(results){
					count = 0;
					results.forEach(function(n,i){
						var winner = n.get("Game").get("Winner");
						var selection = n.get("Selection");
						if (winner == selection) {
							count++
						};
					})
					scores.push([result.get("username"),count]);
				}
			})
		})
		return promise;
	}).then(function(){
		response.success(scores);
	});
});
