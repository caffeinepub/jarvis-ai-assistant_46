import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type UserSettings = {
    languagePreference : Text;
    ttsEnabled : Bool;
    voiceInputEnabled : Bool;
    voiceSpeed : Float; // 1.0 is normal speed
  };

  module UserSettings {
    public func compare(settings1 : UserSettings, settings2 : UserSettings) : Order.Order {
      switch (
        Text.compare(settings1.languagePreference, settings2.languagePreference)
      ) {
        case (#equal) {
          switch (Bool.compare(settings1.ttsEnabled, settings2.ttsEnabled)) {
            case (#equal) {
              switch (Bool.compare(settings1.voiceInputEnabled, settings2.voiceInputEnabled)) {
                case (#equal) { Float.compare(settings1.voiceSpeed, settings2.voiceSpeed) };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  let settingsStore = Map.empty<Principal, UserSettings>();

  // Update or create user settings
  public shared ({ caller }) func saveUserSettings(settings : UserSettings) : async () {
    settingsStore.add(caller, settings);
  };

  // Retrieve user settings
  public shared ({ caller }) func getUserSettings() : async ?UserSettings {
    settingsStore.get(caller);
  };

  // Delete user settings
  public shared ({ caller }) func deleteUserSettings() : async () {
    if (settingsStore.containsKey(caller)) {
      settingsStore.remove(caller);
    } else {
      Runtime.trap("No settings found for caller");
    };
  };

  // Get all settings (anonymous sessions)
  public query func getAllSettings() : async [UserSettings] {
    settingsStore.values().toArray().sort();
  };
};
