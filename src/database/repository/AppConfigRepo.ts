import AppConfig, { AppConfigModel } from "../model/AppConfig";

export default class AppConfigRepo {
  public static getConfig(): Promise<AppConfig | null> {
    return AppConfigModel.findOne().lean<AppConfig>().exec();
  }

  public static async updateConfig(
    newConfig: Partial<AppConfig>
  ): Promise<void> {
    await AppConfigModel.updateOne({}, newConfig);
  }
}
