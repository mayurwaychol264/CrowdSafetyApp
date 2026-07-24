import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
    try {
        // Android notification channel
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
            });
        }

        if (!Device.isDevice) {
            Alert.alert(
                "Physical Device Required",
                "Push notifications require a real phone."
            );
            return null;
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            Alert.alert(
                "Permission Denied",
                "Notification permission is required."
            );
            return null;
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error("EAS project ID was not found.");
        }

        const tokenResponse =
            await Notifications.getExpoPushTokenAsync({
                projectId,
            });

        console.log("Expo Push Token:", tokenResponse.data);

        return tokenResponse.data;
    } catch (error) {
        console.log("Push Token Error:", error);
        return null;
    }
}