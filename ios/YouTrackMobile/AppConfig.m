#import "AppConfig.h"
#import "RCTLog.h"

@implementation AppConfigManager

NSString *youTrackBackendUrl;


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setYouTrackUrl:(NSString *)name)
{
  youTrackBackendUrl = name;
  RCTLogInfo(@"Backend URL has been registered in native: %@", name);
}

+(NSString *)getYouTrackBackendUrl
{
  return youTrackBackendUrl;
}

@end
