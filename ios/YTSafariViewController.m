#import "YTSafariViewController.h"
#import "RCTUtils.h"

@interface YTSafariViewController ()

@end

@implementation YTSafariViewController

// Expose this module to the React Native bridge
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(presentSafari:(NSString *)url) {
  NSLog(@"Presenting with url %@", url);
  
  self.safariView = [[SFSafariViewController alloc] initWithURL:[NSURL URLWithString:url] entersReaderIfAvailable:YES];
  
  self.safariView.delegate = self;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *rootViewController = [[
                                             [UIApplication sharedApplication] keyWindow] rootViewController];
    
    [rootViewController presentViewController:self.safariView animated:YES completion: nil];
  });
}

-(void) safariViewControllerDidFinish:(nonnull SFSafariViewController *)controller {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *rootViewController = [
                                            [[UIApplication sharedApplication] keyWindow] rootViewController];
  
    [rootViewController dismissViewControllerAnimated:YES completion:nil];
  });
}

RCT_EXPORT_METHOD(isAvailable:(RCTResponseSenderBlock)callback)
{
  if ([SFSafariViewController class]) {
    // SafariView is available
    return callback(@[[NSNull null], @true]);
  } else {
    return callback(@[RCTMakeError(@"[SafariView] SafariView is unavailable.", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(dismiss)
{
  [self safariViewControllerDidFinish:self.safariView];
}

@end
