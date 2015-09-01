
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


RCT_EXPORT_METHOD(updateSchedule:(RCTResponseSenderBlock)callback){
  PFQuery *query = [PFQuery queryWithClassName:@"Games"];
  
  [query whereKey:@"updated" equalTo:[NSNumber numberWithBool:YES]];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    if (error) {
      callback(@[]);
    }
    else{
      if (objects.count > 0) {
        for (PFObject *obj in objects) {
          obj[@"updated"] = [NSNumber numberWithBool:NO];
          [obj saveInBackground];
        }
        PFQuery *newQuery = [PFQuery queryWithClassName:@"Games"];
        newQuery.limit = 300;
        [newQuery findObjectsInBackgroundWithBlock:^(NSArray *allGames, NSError *Error){
          [PFObject pinAllInBackground:allGames block:^(BOOL succeed, NSError* saveError){
            callback(@[]);
          }];
        }];
      }
      else{
        PFQuery *localQuery = [PFQuery queryWithClassName:@"Games"];
        [localQuery fromLocalDatastore];
        [localQuery findObjectsInBackgroundWithBlock:^(NSArray *localGames, NSError *localError){
          if (localGames.count == 0) {
            PFQuery *newQuery = [PFQuery queryWithClassName:@"Games"];
            newQuery.limit = 300;
            [newQuery findObjectsInBackgroundWithBlock:^(NSArray *allGames, NSError *Error){
              [PFObject pinAllInBackground:allGames block:^(BOOL succeed, NSError* saveError){
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

RCT_EXPORT_METHOD(queryClass:(NSString*)class whereColumn:(NSString*)col equalsValue:(NSNumber*)value fromLocal:(BOOL)fromLocal keys:(NSArray*)keys callback:(RCTResponseSenderBlock)callback ) {
  PFQuery *query = [PFQuery queryWithClassName:class];
  
  if (col != nil) {
    if ([col isEqualToString:@"User"]) {
      [query whereKey:@"User" equalTo:[PFUser currentUser]];
    }else{
      [query whereKey:col equalTo:value];
    }
  }
  
  if (fromLocal) {
    [query fromLocalDatastore];
  }
  
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
   
    NSMutableArray *returnArray = [[NSMutableArray alloc]init];

    for (PFObject* obj in objects) {
      NSMutableArray* buildingArray = [[NSMutableArray alloc]init];
      [buildingArray addObject:obj.objectId];
      for (NSString* key in keys) {
        if ([obj[key] isKindOfClass:[PFObject class]]) {
          [buildingArray addObject:((PFObject*)obj[key]).objectId];
        }
        else if(!(obj[key])){
          [buildingArray addObject:[NSNull null]];
        }
        else{
          NSLog(@"%@",obj[key]);
          [buildingArray addObject:obj[key]];
        }
      }
      [returnArray addObject:buildingArray];
    }
   
    callback(@[[returnArray copy]]);
    
  }];
};

RCT_REMAP_METHOD(login,unsername:(NSString *)username callback:(RCTResponseSenderBlock)callback){
  [PFTwitterUtils logInWithBlock:^(PFUser *user, NSError *error) {
    if (!user) {
      NSLog(@"Uh oh. The user cancelled the Twitter login. %@", error);
      return;
    } else if (user.isNew) {
      NSLog(@"User signed up and logged in with Twitter!");
      user.username = username;
      NSLog(@"%@ %@",user.username, user[@"isAdmin"]);
      [user saveInBackgroundWithBlock:^(BOOL succeed, NSError *err){
        callback(@[user.username, [NSNumber numberWithBool:NO]]);
      }];
    } else {
      NSLog(@"User logged in with Twitter! \n %@", user);
      user.username = username;
      NSLog(@"%@ %@",user.username, user[@"isAdmin"]);
      NSNumber *isAdmin = [NSNumber numberWithBool:NO];
      if (user[@"isAdmin"]) {
        isAdmin = [NSNumber numberWithBool:YES];
      }
      [user saveInBackgroundWithBlock:^(BOOL succeed, NSError *err){
        callback(@[user.username, isAdmin]);
      }];
    }
  }];
}

RCT_EXPORT_METHOD(saveSelection:(NSString*)objectId selectionId:(NSString*)selectionId selection:(NSString*)selection isDouble:(BOOL)isDouble callback:(RCTResponseSenderBlock)callback){
  PFQuery* query = [PFQuery queryWithClassName:@"Selections"];
  //[query fromLocalDatastore];
  
  [query getObjectInBackgroundWithId:selectionId block:^(PFObject* object, NSError *error){

    PFObject* choice = [PFObject objectWithClassName:@"Selections"];

    if (object) {
      choice = object;
    }
    else{
      PFUser* user = [PFUser currentUser];
      PFObject* game = [PFObject objectWithoutDataWithClassName:@"Games" objectId:objectId];
      choice[@"Game"] = game;
      choice[@"User"] = user;
    }
    choice[@"Selection"] = selection;
    choice[@"isDouble"] = [NSNumber numberWithBool:isDouble];
    
    [choice saveInBackgroundWithBlock:^(BOOL succeed, NSError* error){
      if (succeed) {
        NSLog(@"Yay %@", choice.objectId );
        callback(@[choice.objectId]);
      }
      else{
        NSLog(@"BOO");
      }
      
      
    }];
  }];
}
RCT_EXPORT_METHOD(saveResult:(NSString*)objectId winner:(NSString *)winner callback:(RCTResponseSenderBlock)callback){
  PFQuery* query = [PFQuery queryWithClassName:@"Games"];
  [query getObjectInBackgroundWithId:objectId block:^(PFObject* object, NSError *error){
    object[@"Winner"] = winner;
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

RCT_EXPORT_METHOD(getScoreForCurrentUser:(NSNumber*)week errorCB:(RCTResponseSenderBlock)errorCB callback:(RCTResponseSenderBlock)callback){
  [[self callGetScoreForUser:[PFUser currentUser].objectId week:week] continueWithBlock:^id(BFTask* task){

    NSLog(@"%@",task.result);
    if (task.error) {
      errorCB(@[]);
    }
    else{
      callback(@[task.result]);
    }
    return nil;
  }];
  
}
RCT_EXPORT_METHOD(getAllScores:(RCTResponseSenderBlock)callback){
  [PFCloud callFunctionInBackground:@"getAllScores" withParameters:@{@"week":[NSNumber numberWithInt:0]} block:^(NSArray* result, NSError* error){
    callback(result);
  }];
}

RCT_EXPORT_METHOD(checkIfDoubleIsLegal:(NSString*)teamName callback:(RCTResponseSenderBlock)callback){
  PFQuery *arrayQuery = [PFUser query];
  [arrayQuery getObjectInBackgroundWithId:[PFUser currentUser].objectId block:^(PFObject *object, NSError* error){
    NSMutableArray* doubleArray;
    if(object[@"doubles"]){
      doubleArray = object[@"doubles"];
    }
    else{
      doubleArray  = [[NSMutableArray alloc]init];
    }
    if ([doubleArray indexOfObject:teamName] == NSNotFound) {
      callback(@[@"continue"]);
    }
    else{
      callback(@[]);
    }
  }];
}

RCT_EXPORT_METHOD(setDouble:(NSNumber*)week selectionId:(NSString *)selectionId callback:(RCTResponseSenderBlock)callback){
  PFQuery *inner = [PFQuery queryWithClassName:@"Games"];
  [inner whereKey:@"Week" equalTo:week];
  PFQuery *outer = [PFQuery queryWithClassName:@"Selections"];
  [outer whereKey:@"Game" matchesQuery:inner];
  [outer includeKey:@"Game"];
  [outer findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    NSLog(@"objects %@", objects);
    for (PFObject *obj in objects) {
      NSLog(@"objID = %@", obj.objectId);
      NSLog(@"%@",obj[@"isDouble"]);
      if ([obj.objectId isEqualToString:selectionId]) {
        obj[@"isDouble"] = [NSNumber numberWithBool:YES];
      }
      else if([obj[@"isDouble"] isEqualToNumber:[NSNumber numberWithBool:YES] ]){
        obj[@"isDouble"] = [NSNumber numberWithBool:NO];
        NSString *selection = obj[@"Selection"];
        NSLog(@"%@ %@",selection, obj[@"Game"][selection]);
        [PFCloud callFunctionInBackground:@"changeDoubleArray" withParameters:@{@"userId":[PFUser currentUser].objectId,@"team":obj[@"Game"][selection] ,@"shouldAdd":[NSNumber numberWithBool:NO]}];
      }
    }
    [PFObject saveAll:objects];
    callback(@[]);
  }];
  
}

RCT_EXPORT_METHOD(getOthersPicks:(NSString *)gameId callback:(RCTResponseSenderBlock)callback){
  PFObject *game = [PFQuery getObjectOfClass:@"Games" objectId:gameId];
  PFQuery *query = [PFQuery queryWithClassName:@"Selections"];
  [query whereKey:@"Game" equalTo:game];
  [query whereKey:@"User" notEqualTo:[PFUser currentUser]];
  [query includeKey:@"User"];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    if (objects) {
    NSMutableArray *ret = [[NSMutableArray alloc]init];
    for (PFObject *obj in objects) {
      [ret addObject:@[((PFUser *)obj[@"User"]).username,obj[@"Selection"]]];
    }
    callback(@[[ret copy]]);
    }
    else{
      callback(@[]);
    }
  }];
  
}

RCT_EXPORT_METHOD(changeDoubleArray:(BOOL *)shouldAdd teamName:(NSString*)teamName callback:(RCTResponseSenderBlock)callback){
  [PFCloud callFunctionInBackground:@"changeDoubleArray" withParameters:@{@"userId":[PFUser currentUser].objectId,@"team":teamName, @"shouldAdd":[NSNumber numberWithBool:shouldAdd]} block:^(NSString* result, NSError* error){
    callback(@[result]);
  }];
}

-(BFTask *)callGetScoreForUser:(NSString*)user week:(NSNumber*)week{
  return [PFCloud callFunctionInBackground:@"getScoreForUser" withParameters:@{@"user":user,@"week":week}];
}
@end
