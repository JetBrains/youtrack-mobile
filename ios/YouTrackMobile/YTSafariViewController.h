#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <SafariServices/SafariServices.h>

@interface YTSafariViewController : NSObject <RCTBridgeModule, SFSafariViewControllerDelegate>

@end
