#import "AppConfig.h"
#import "RCTLog.h"

@implementation AppConfigManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setYouTrackUrl:(NSString *)name)
{
  RCTLogInfo(@"Pretending to create an event %@", name);
}

@end
