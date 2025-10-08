import { Settings, ISettings } from '../models/settings';
import logger from '../utils/logger';

export class SettingsService {
  async getSettings(): Promise<ISettings> {
    const settings = await Settings.findOne();
    if (!settings) {
      const newSettings = await Settings.create({});
      logger.info('Default settings created');
      return newSettings;
    }
    return settings;
  }

  async updateSettings(data: Partial<ISettings>): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    logger.info('Settings updated');
    return settings;
  }
}

export default new SettingsService();
