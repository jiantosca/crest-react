
import { Storage } from "./storage";

export type SettingsType = {
    serviceTimeout: number
    historyLimit: number
    isDarkMode: boolean
    isDrawerOpen: boolean
    isSettingsOpen: boolean
    response: {
        highlightBytesLimit: number
        isWordWrap: boolean
    }
}

/**
 * This class is responsible for managing the settings for the application. If no settings exist it will always create then
 * with some defaults. Typically needed on a new install of the ext, or if the user clears their local storage which most
 * people would never do.
 * 
 * Used to call the class Settings but mui has one with that name.
 */
export class AppSettings {

    static get(): SettingsType {
        let settings = Storage.getSettings()
        if (settings === null) {
            settings = {
                serviceTimeout: 30000,
                historyLimit: 50,
                isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
                isDrawerOpen: false,
                isSettingsOpen: false,
                response: {
                    highlightBytesLimit: 160000,
                    isWordWrap: false
                }
            }
            Storage.storeSettings(settings)
            //console.log('getSettings() - settings stored')
        } else {
            //console.log('getSettings() - settings already exist')
        }

        return settings
    }

    static isDrawerOpen(): boolean {
        return AppSettings.get().isDrawerOpen
    }
    static toggleDrawer(): boolean {
        const settings = AppSettings.get()
        const toggled = !settings.isDrawerOpen
        Storage.storeSettings({ ...settings, isDrawerOpen: toggled })
        return toggled
    }

    static isDarkMode(): boolean {
        return AppSettings.get().isDarkMode
    }
    static toggleDarkMode(): boolean {
        const settings = AppSettings.get()
        const toggled = !settings.isDarkMode
        Storage.storeSettings({ ...settings, isDarkMode: toggled })
        return toggled
    }

    static isWordWrap(): boolean {
        return AppSettings.get().response.isWordWrap
    }
    static toggleWordWrap(): boolean {
        const settings = AppSettings.get()
        settings.response.isWordWrap = !settings.response.isWordWrap
        Storage.storeSettings(settings)
        return settings.response.isWordWrap
    }
    static isSettingsOpen(): boolean {
        // adding this check because the settings open/close state was added after the initial release. Should never
        // be undefined for new install
        if(AppSettings.get().isSettingsOpen === undefined) {
            const settings = AppSettings.get()
            settings.isSettingsOpen = false
            Storage.storeSettings(settings)
        }
        return AppSettings.get().isSettingsOpen
    }

    static toggleSettings(): boolean {
        const settings = AppSettings.get()
        settings.isSettingsOpen = !settings.isSettingsOpen
        Storage.storeSettings(settings)
        return settings.isSettingsOpen
    }

    static getPrettyPrintBytesLimit(): number {
        return AppSettings.get().response.highlightBytesLimit
    }
    static setPrettyPrintBytesLimit(newPrettyPrintBytesLimit: number): void {
        const settings = AppSettings.get()
        settings.response.highlightBytesLimit = newPrettyPrintBytesLimit
        Storage.storeSettings(settings)
    }

    static getHistoryLimit(): number {
        return AppSettings.get().historyLimit
    }
    static setHistoryLimit(newLimit: number): void {
        const settings = AppSettings.get()
        settings.historyLimit = newLimit
        Storage.storeSettings(settings)
    }

    static getServiceTimeout(): number {
        return AppSettings.get().serviceTimeout
    }
    static setServiceTimeout(newTimeout: number): void {
        const settings = AppSettings.get()
        settings.serviceTimeout = newTimeout
        Storage.storeSettings(settings)
    }
}