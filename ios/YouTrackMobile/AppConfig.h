#import "RCTBridgeModule.h"

@interface AppConfigManager : NSObject<RCTBridgeModule>

+ (NSString *) getYouTrackBackendUrl;

@end
