export default class MobileVersionCheckRepo {
  public static async checkAndroidVersion(
    versionCode: number
  ): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async checkIOSVersion(versionCode: number): Promise<boolean> {
    return false;
  }
}
