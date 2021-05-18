#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <SafariServices/SafariServices.h>

@interface YTSafariViewController : NSObject <RCTBridgeModule, SFSafariViewControllerDelegate>

@property (nonatomic) SFSafariViewController *safariView;

@end
