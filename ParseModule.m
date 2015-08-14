
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
        callback(@[@"update"]);
      }
      else{
        callback(@[]);
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
    //[query fromLocalDatastore];
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
//        else if([obj[key] isKindOfClass:[NSDate class]]){
//          NSString *date = [NSDateFormatter localizedStringFromDate:((NSDate*)obj[key]) dateStyle:NSDateFormatterMediumStyle timeStyle:NSDateFormatterShortStyle];
//          [buildingArray addObject:date];
//        }
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
    if (!fromLocal) {
      [PFObject pinAllInBackground:objects];
    }
    
    callback(@[[returnArray copy]]);
    
  }];
};

RCT_REMAP_METHOD(login,callback:(RCTResponseSenderBlock)callback){
  [PFTwitterUtils logInWithBlock:^(PFUser *user, NSError *error) {
    if (!user) {
      NSLog(@"Uh oh. The user cancelled the Twitter login. %@", error);
      return;
    } else if (user.isNew) {
      NSLog(@"User signed up and logged in with Twitter!");
    } else {
      NSLog(@"User logged in with Twitter! \n %@", user);
            
      callback(@[user.username, user[@"isAdmin"]]);
    }
  }];
}

RCT_EXPORT_METHOD(saveSelection:(NSString*)objectId selection:(NSString*)selection callback:(RCTResponseSenderBlock)callback){
  PFQuery* query = [PFQuery queryWithClassName:@"Selections"];
  
  PFUser* user = [PFUser currentUser];
  PFObject* game = [PFObject objectWithoutDataWithClassName:@"Games" objectId:objectId];
  [query whereKey:@"Game" equalTo:game];
  [query whereKey:@"User" equalTo:user];
  [query findObjectsInBackgroundWithBlock:^(NSArray* objects, NSError *error){

    PFObject* choice = [PFObject objectWithClassName:@"Selections"];

    if (objects.count > 0) {
      choice = objects[0];
    }
    else{
      choice[@"Game"] = game;
      choice[@"User"] = user;
    }
    choice[@"Selection"] = selection;
    [choice saveInBackgroundWithBlock:^(BOOL succeed, NSError* error){
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

-(BFTask *)callGetScoreForUser:(NSString*)user week:(NSNumber*)week{
  return [PFCloud callFunctionInBackground:@"getScoreForUser" withParameters:@{@"user":user,@"week":week}];
}
@end
