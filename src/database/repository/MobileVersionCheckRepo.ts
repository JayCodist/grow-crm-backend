import {
  BlacklistVersionAndroidModel,
  BlacklistVersionIOSModel,
  LastBreakingChangeAndroidModel,
  LastBreakingChangeIOSModel,
  Version
} from "../model/MobileVersions";

const latestVersionSort = { versionCode: "desc" };
const versionProjection = "versionCode -_id";

export default class MobileVersionCheckRepo {
  public static async checkAndroidVersion(
    versionCode: number
  ): Promise<boolean> {
    const responseLBC = LastBreakingChangeAndroidModel.find()
      .sort(latestVersionSort)
      .limit(1)
      .lean<Version[]>()
      .select(versionProjection)
      .exec();
    const responseBLV = BlacklistVersionAndroidModel.findOne({
      versionCode
    })
      .lean<Version>()
      .select(versionProjection)
      .exec();
    const [breakingChanges, matchingBlacklistedVersion]: [
      Version[],
      Version | null
    ] = await Promise.all([responseLBC, responseBLV]);
    const lastBreakingVersion = breakingChanges[0]?.versionCode;
    return (
      !matchingBlacklistedVersion && (lastBreakingVersion || 0) <= versionCode
    );
  }

  public static async checkIOSVersion(versionCode: number): Promise<boolean> {
    const responseLBC = LastBreakingChangeIOSModel.find()
      .sort(latestVersionSort)
      .limit(1)
      .lean<Version[]>()
      .select(versionProjection)
      .exec();
    const responseBLV = BlacklistVersionIOSModel.findOne({
      versionCode
    })
      .lean<Version>()
      .select(versionProjection)
      .exec();
    const [breakingChanges, matchingBlacklistedVersion]: [
      Version[],
      Version | null
    ] = await Promise.all([responseLBC, responseBLV]);
    const lastBreakingVersion = breakingChanges[0]?.versionCode;
    return (
      !matchingBlacklistedVersion && (lastBreakingVersion || 0) <= versionCode
    );
  }
}
