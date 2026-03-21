import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserSettings {
    languagePreference: string;
    voiceSpeed: number;
    voiceInputEnabled: boolean;
    ttsEnabled: boolean;
}
export interface backendInterface {
    deleteUserSettings(): Promise<void>;
    getAllSettings(): Promise<Array<UserSettings>>;
    getUserSettings(): Promise<UserSettings | null>;
    saveUserSettings(settings: UserSettings): Promise<void>;
}
