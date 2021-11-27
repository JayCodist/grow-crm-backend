import {
  BlacklistVersionAndroidModel,
  LastBreakingChangeAndroidModel,
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
      !matchingBlacklistedVersion &&
      (lastBreakingVersion || Infinity) <= versionCode
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async checkIOSVersion(versionCode: number): Promise<boolean> {
    return false;
  }
}
