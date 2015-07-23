
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

RCT_EXPORT_METHOD(queryClass:(NSString*)class whereColumn:(NSString*)col equalsValue:(NSNumber*)value keys:(NSArray*)keys callback:(RCTResponseSenderBlock)callback) {
  PFQuery *query = [PFQuery queryWithClassName:class];
  
  NSLog(@"key %@, value %@",col, value);
  
  [query whereKey:col equalTo:value];
  
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
    NSMutableArray *returnArray = [[NSMutableArray alloc]init];

    for (PFObject* obj in objects) {
      NSLog(@"%@",obj[@"Week"]);
      NSMutableArray* buildingArray = [[NSMutableArray alloc]init];
      [buildingArray addObject:obj.objectId];
      for (NSString* key in keys) {
        [buildingArray addObject:obj[key]];
      }
      [returnArray addObject:buildingArray];
    }
    NSLog(@"ret array %@",returnArray);
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
      callback(@[user.username]);
    }
  }];
}
RCT_EXPORT_METHOD(loginWithTwitter){
  [PFTwitterUtils logInWithBlock:^(PFUser *user, NSError *error) {
    if (!user) {
      NSLog(@"Uh oh. The user cancelled the Twitter login.");
      return;
    } else if (user.isNew) {
      NSLog(@"User signed up and logged in with Twitter!");
    } else {
      NSLog(@"User logged in with Twitter! \n %@", user);
      //callback(@[user]);
    }
  }];
}
@end
