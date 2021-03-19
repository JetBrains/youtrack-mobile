#import "YTSafariViewController.h"

@interface YTSafariViewController ()

@end

@implementation YTSafariViewController

// Expose this module to the React Native bridge
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(presentSafari:(NSString *)url) {
  NSLog(@"Presenting with url %@", url);

  SFSafariViewController *safariViewController = [[SFSafariViewController alloc]
    initWithURL:[NSURL URLWithString:url]
    entersReaderIfAvailable:YES];

  safariViewController.delegate = self;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *rootViewController = [[
      [UIApplication sharedApplication] keyWindow] rootViewController];

    [rootViewController presentViewController:safariViewController animated:YES completion: nil];
  });
}

-(void) safariViewControllerDidFinish:(nonnull SFSafariViewController *)controller {
  UIViewController *rootViewController = [
    [[UIApplication sharedApplication] keyWindow] rootViewController];

  [rootViewController dismissViewControllerAnimated:YES completion:nil];
}

@end
