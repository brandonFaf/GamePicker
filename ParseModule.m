
//
//  AuthWrap.h
//  GamePicker
//
//  Created by Brandon Myers on 7/20/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//


#import "ParseModule.h"

@implementation ParseModule

RCT_EXPORT_MODULE();

//update to check to see if the local datastore needs to be updated
RCT_EXPORT_METHOD(updateSchedule:(RCTResponseSenderBlock)callback){
  PFQuery *query = [PFUser query];
  
  //find the current user whose update field is true
  [query whereKey:@"objectId" equalTo:[PFUser currentUser].objectId];
  [query whereKey:@"needsUpdate" equalTo:[NSNumber numberWithBool:YES]];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    if (error) {
      callback(@[]);
    }
    else{
      //if something exists
      if (objects.count > 0) {
        //update the column because the user no longer needs updates
        objects[0][@"needsUpdate"] = [NSNumber numberWithBool:NO];
        [objects[0] saveInBackground];
        //get the games
        PFQuery *newQuery = [PFQuery queryWithClassName:@"Games"];
        //need to set limit to get all the games(default is 100)
        newQuery.limit = 300;
        //find the objects
        [newQuery findObjectsInBackgroundWithBlock:^(NSArray *allGames, NSError *Error){
          //pin all the objects to the local datastore
          [PFObject pinAllInBackground:allGames block:^(BOOL succeed, NSError* saveError){
            //run the callback to continue the the javascript side
            callback(@[]);
          }];
        }];
      }
      else{
        //check the local store to see if there are games saved
        PFQuery *localQuery = [PFQuery queryWithClassName:@"Games"];
        [localQuery fromLocalDatastore];
        //run the querey
        [localQuery findObjectsInBackgroundWithBlock:^(NSArray *localGames, NSError *localError){
          //if ther eare no games
          if (localGames.count == 0) {
            //get the games
            PFQuery *newQuery = [PFQuery queryWithClassName:@"Games"];
            //need to set limit to get all the games(default is 100)
            newQuery.limit = 300;
            //find the games
            [newQuery findObjectsInBackgroundWithBlock:^(NSArray *allGames, NSError *Error){
              //pin al lthe object to the local datastore
              [PFObject pinAllInBackground:allGames block:^(BOOL succeed, NSError* saveError){
                //run the callback to continue the javascript side
                callback(@[]);
              }];
            }];
          }
          else{
            callback(@[]);
          }
        }];
      }
    }
  }];
    
}

//do a parse query
RCT_EXPORT_METHOD(queryClass:(NSString*)class whereColumn:(NSString*)col equalsValue:(NSNumber*)value fromLocal:(BOOL)fromLocal keys:(NSArray*)keys callback:(RCTResponseSenderBlock)callback ) {
  PFQuery *query = [PFQuery queryWithClassName:class];
  //if a where column was provided
  if (col != nil) {
    //if the where is a User do a query for the current user
    if ([col isEqualToString:@"User"]) {
      [query whereKey:@"User" equalTo:[PFUser currentUser]];
    }else{
      //set the condition
      [query whereKey:col equalTo:value];
    }
  }
  
  //if from local is true make the query from the local store
  if (fromLocal) {
    [query fromLocalDatastore];
  }
  
  //need to set limit to get all the games(default is 100)
  query.limit = 300;
  
  //run the query
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
   
    //set up the array that will be returned
    NSMutableArray *returnArray = [[NSMutableArray alloc]init];

    //for each object
    for (PFObject* obj in objects) {
      //set up an array that will hold the data from the object
      NSMutableArray* buildingArray = [[NSMutableArray alloc]init];
      //add the object Id first
      [buildingArray addObject:obj.objectId];
      //for each of the keys that was passed in
      for (NSString* key in keys) {
        //if the key is a reference to another Parse class
        if ([obj[key] isKindOfClass:[PFObject class]]) {
          //get the id for the reference object
          [buildingArray addObject:((PFObject*)obj[key]).objectId];
        }
        //if the value in the column is null insert a null
        else if(!(obj[key])){
          [buildingArray addObject:[NSNull null]];
        }
        else{
          //add the value to the building array
          [buildingArray addObject:obj[key]];
        }
      }
      //add the building array to the return array
      [returnArray addObject:buildingArray];
    }
    //return the returnArray
    callback(@[[returnArray copy]]);
    
  }];
};

//Separate login method for Jonny who didn't have a twitter. Could use this on the login screen to login without twitter
RCT_REMAP_METHOD(loginJonny, leage:(NSString *)league callback:(RCTResponseSenderBlock)callback){
  //set up a user
  PFUser *user = [PFUser user];
  //set a username and password and leauge for the user
  user.username = @"BrandonTopKrisBottom";
  user.password = @"Password1";
  user[@"league"] = @[league];
  
  //signup the user
  [user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (!error) {
      //callback the user info
      callback(@[user.username, [NSNumber numberWithBool:NO]]);
      // Hooray! Let them use the app now.
    } else {   NSString *errorString = [error userInfo][@"error"];   // Show the errorString somewhere and let the user try again.
    }
  }];
}


//login with twitter credentials
RCT_REMAP_METHOD(login,username:(NSString *)username leage:(NSString *)league callback:(RCTResponseSenderBlock)callback){
  //login with twitter
  [PFTwitterUtils logInWithBlock:^(PFUser *user, NSError *error) {
    //if the user isn't returned then something went wrong
    if (!user) {
      NSLog(@"Uh oh. The user cancelled the Twitter login. %@", error);
      return;
    }
    //if the user is new
    else if (user.isNew) {
      NSLog(@"User signed up and logged in with Twitter!");
      //set the username and league
      user.username = username;
      user[@"league"] = @[league];
      [user saveInBackgroundWithBlock:^(BOOL succeed, NSError *err){
        //after the use is saved, return the info
        callback(@[user.username, [NSNumber numberWithBool:NO]]);
      }];
    } else {
      NSLog(@"User logged in with Twitter! \n %@", user);
      //set the username
      user.username = username;
      NSNumber *isAdmin = [NSNumber numberWithBool:NO];
      //check if user is admin
      if (user[@"isAdmin"]) {
        isAdmin = [NSNumber numberWithBool:YES];
      }
      [user saveInBackgroundWithBlock:^(BOOL succeed, NSError *err){
        //after the user is saved, return the info
        callback(@[user.username, isAdmin]);
      }];
    }
  }];
}

//save the users selection
RCT_EXPORT_METHOD(saveSelection:(NSString*)objectId selectionId:(NSString*)selectionId selection:(NSString*)selection isDouble:(BOOL)isDouble callback:(RCTResponseSenderBlock)callback){

  PFQuery* query = [PFQuery queryWithClassName:@"Selections"];

  //query the selections to find the selction that matches the selection ID
  [query getObjectInBackgroundWithId:selectionId block:^(PFObject* object, NSError *error){
    
    //create a selection Object
    PFObject* choice = [PFObject objectWithClassName:@"Selections"];

    //object exists set the choice object to the existing seleciton
    if (object) {
      choice = object;
    }
    else{
      //create the objects that will be referenced in the selection
      PFUser* user = [PFUser currentUser];
      PFObject* game = [PFObject objectWithoutDataWithClassName:@"Games" objectId:objectId];
      choice[@"Game"] = game;
      choice[@"User"] = user;
    }
    //set the seelection
    //set if the selection is a double
    choice[@"Selection"] = selection;
    choice[@"isDouble"] = [NSNumber numberWithBool:isDouble];
    
    //asve the selection
    [choice saveInBackgroundWithBlock:^(BOOL succeed, NSError* error){
      if (succeed) {
        NSLog(@"Yay %@", choice.objectId );
        //return the selection ID
        callback(@[choice.objectId]);
      }
      else{
        NSLog(@"BOO");
      }
      
      
    }];
  }];
}

//save the winner for a game
RCT_EXPORT_METHOD(saveResult:(NSString*)objectId winner:(NSString *)winner callback:(RCTResponseSenderBlock)callback){
  PFQuery* query = [PFQuery queryWithClassName:@"Games"];
  //get the games object with the objectID
  [query getObjectInBackgroundWithId:objectId block:^(PFObject* object, NSError *error){
    //set the Winner to  the selection
    object[@"Winner"] = winner;
    //save the game
    [object saveInBackgroundWithBlock:^(BOOL succeed, NSError* error){
      if (succeed) {
        NSLog(@"Yay");
        callback(@[]);
      }
      else{
        NSLog(@"BOO");
      }
    }];
  }];
}

//call the cloud code method to get the score for the current user  for a certain week
RCT_EXPORT_METHOD(getScoreForCurrentUser:(NSNumber*)week errorCB:(RCTResponseSenderBlock)errorCB callback:(RCTResponseSenderBlock)callback){
  //call method that calls cloud code
  [[self callGetScoreForUser:[PFUser currentUser].objectId week:week] continueWithBlock:^id(BFTask* task){

    //if there is no issue return the result
    if (task.error) {
      errorCB(@[]);
    }
    else{
      callback(@[task.result]);
    }
    return nil;
  }];
  
}
//call cloud code to get the socres for all users in a league
RCT_EXPORT_METHOD(getAllScoresForLeague:(NSString *) league callback:(RCTResponseSenderBlock)callback){
  [PFCloud callFunctionInBackground:@"getAllScores" withParameters:@{@"week":[NSNumber numberWithInt:0], @"league":league} block:^(NSArray* result, NSError* error){
    callback(result);
  }];
}

//check the user's double array to see if hte team has been used before
RCT_EXPORT_METHOD(checkIfDoubleIsLegal:(NSString*)teamName callback:(RCTResponseSenderBlock)callback){
  PFQuery *arrayQuery = [PFUser query];
  //get the current user
  [arrayQuery getObjectInBackgroundWithId:[PFUser currentUser].objectId block:^(PFObject *object, NSError* error){
    NSMutableArray* doubleArray;
    //if a double array exists set it to a local variable
    if(object[@"doubles"]){
      doubleArray = object[@"doubles"];
    }
    else{
      doubleArray  = [[NSMutableArray alloc]init];
    }
    //if the team name is not found then can continue else return nothing
    if ([doubleArray indexOfObject:teamName] == NSNotFound) {
      callback(@[@"continue"]);
    }
    else{
      callback(@[]);
    }
  }];
}

//set a game as double
RCT_EXPORT_METHOD(setDouble:(NSNumber*)week selectionId:(NSString *)selectionId callback:(RCTResponseSenderBlock)callback){
  //do a join on games and selections to get selections of games for that week
  PFQuery *inner = [PFQuery queryWithClassName:@"Games"];
  [inner whereKey:@"Week" equalTo:week];
  PFQuery *outer = [PFQuery queryWithClassName:@"Selections"];
  [outer whereKey:@"Game" matchesQuery:inner];
  [outer includeKey:@"Game"];
  //get objects
  [outer findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    //for each object
    for (PFObject *obj in objects) {
      //if its the selection mark it as double, else take the double off and remove the team from the double array
      if ([obj.objectId isEqualToString:selectionId]) {
        obj[@"isDouble"] = [NSNumber numberWithBool:YES];
      }
      else if([obj[@"isDouble"] isEqualToNumber:[NSNumber numberWithBool:YES] ]){
        //set double to no
        obj[@"isDouble"] = [NSNumber numberWithBool:NO];
        //get the selection
        NSString *selection = obj[@"Selection"];
        //remove the team from the doubles array
        [PFCloud callFunctionInBackground:@"changeDoubleArray" withParameters:@{@"userId":[PFUser currentUser].objectId,@"team":obj[@"Game"][selection] ,@"shouldAdd":[NSNumber numberWithBool:NO]}];
      }
    }
    //save to update objects
    [PFObject saveAll:objects];
    callback(@[]);
  }];
  
}

//get the picks of other users to show when current user is making pick
RCT_EXPORT_METHOD(getOthersPicks:(NSString *)gameId league:(NSString*)league callback:(RCTResponseSenderBlock)callback){
  //create game object with the gameId
  PFObject *game = [PFQuery getObjectOfClass:@"Games" objectId:gameId];
  PFQuery *query = [PFQuery queryWithClassName:@"Selections"];
  //set conditions
  [query whereKey:@"Game" equalTo:game];
  [query whereKey:@"User" notEqualTo:[PFUser currentUser]];
  [query includeKey:@"User"];
  //get the selection objects
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    //if objects exist
    if (objects) {
    NSMutableArray *ret = [[NSMutableArray alloc]init];
      //for each object
    for (PFObject *obj in objects) {
      //if the user of the selction belongs to the current users leauge
      if ([obj[@"User"][@"league"][0] isEqualToString:league]) {
        //add the user and selection
        [ret addObject:@[((PFUser *)obj[@"User"]).username,obj[@"Selection"]]];
      }
    }
    //return the arry of users and their selection
    callback(@[[ret copy]]);
    }
    else{
      callback(@[]);
    }
  }];
  
}

//call cloud mehtod to add a team name or remove a team name from the users double array
RCT_EXPORT_METHOD(changeDoubleArray:(BOOL *)shouldAdd teamName:(NSString*)teamName callback:(RCTResponseSenderBlock)callback){
  [PFCloud callFunctionInBackground:@"changeDoubleArray" withParameters:@{@"userId":[PFUser currentUser].objectId,@"team":teamName, @"shouldAdd":[NSNumber numberWithBool:shouldAdd]} block:^(NSString* result, NSError* error){
    callback(@[result]);
  }];
}

//call cloud method to get score for a user for a specific week
-(BFTask *)callGetScoreForUser:(NSString*)user week:(NSNumber*)week{
  return [PFCloud callFunctionInBackground:@"getScoreForUser" withParameters:@{@"user":user,@"week":week}];
}
@end
