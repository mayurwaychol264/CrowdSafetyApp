import React, { useState, useRef } from 'react';
import * as Location from 'expo-location';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

import { auth } from '../firebase/config';
const API_BASE_URL = "http://172.25.93.164:5000";
export default function SosScreen({ navigation }) {

    const [sending, setSending] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const startCountdown = () => {

        setTimerRunning(true);
        setCountdown(3);

        let count = 3;

        timerRef.current = setInterval(() => {

            count--;

            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(timerRef.current);
                setCountdown(null);
                setTimerRunning(false);

                sendSOS();
            }

        }, 1000);
    };
    const sendSOS = async () => {
        setSending(true);

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("You must be logged in to send SOS.");
            }

            if (!API_BASE_URL) {
                throw new Error("Backend URL is not configured.");
            }

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required."
                );
                return;
            }

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            const idToken = await user.getIdToken(true);
            console.log("FRESH TOKEN:", idToken);

            const response = await fetch(
                `${API_BASE_URL}/api/sos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        latitude:
                            currentLocation.coords.latitude,
                        longitude:
                            currentLocation.coords.longitude,
                        message:
                            "Emergency! I need immediate help.",
                    }),
                }
            );

            const responseData = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                    `Request failed with status ${response.status}`
                );
            }

            Alert.alert(
                "✅ SOS Sent",
                "Emergency alert has been sent successfully.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            navigation.navigate("Home"),
                    },
                ]
            );
        } catch (error) {
            console.error("SOS error:", error);

            Alert.alert(
                "SOS Failed",
                error.message ||
                "Unable to send SOS. Please try again."
            );
        } finally {
            setSending(false);
        }

    };
    const cancelSOS = () => {

        clearInterval(timerRef.current);

        setCountdown(null);

        setTimerRunning(false);

        setSending(false);

        Alert.alert(
            "Cancelled",
            "SOS was not sent."
        );

    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Emergency SOS
            </Text>
            <Text style={styles.subtitle}>
                If you are in danger,
                press the button below.
            </Text>
            {
                timerRunning && (

                    <Text style={styles.countdownText}>
                        {countdown}
                    </Text>

                )
            }
            <TouchableOpacity
                style={[
                    styles.sosButton,
                    sending && { opacity: 0.6 }
                ]}
                onPress={() => {
                    Alert.alert(
                        "🚨 Confirm SOS",
                        "Are you sure you want to send an emergency alert?",
                        [
                            {
                                text: "Cancel",
                                style: "cancel",
                            },
                            {
                                text: "Start Countdown",
                                style: "destructive",
                                onPress: startCountdown,
                            },
                        ]
                    );
                }}
                disabled={sending || timerRunning}
            >


                <Text style={styles.sosText}>
                    {sending ? "Sending..." : "SOS"}
                </Text>
            </TouchableOpacity>


            {
                timerRunning && (

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelSOS}
                    >

                        <Text style={styles.cancelText}>
                            Cancel SOS
                        </Text>

                    </TouchableOpacity>

                )
            }


            <View style={styles.statusCard}>

                <Text style={styles.statusTitle}>
                    Emergency Status
                </Text>

                <Text style={styles.statusText}>
                    📍 Location Ready
                </Text>

                <Text style={styles.statusText}>
                    👥 Emergency Contacts Loaded
                </Text>

            </View>
            <Text style={styles.info}>
                Press only in emergency situations
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    sosButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },

    sosText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
    },

    info: {
        marginTop: 25,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    statusCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginTop: 30,
        elevation: 5,
    },

    statusTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },

    statusText: {
        fontSize: 15,
        marginBottom: 8,
        color: "#374151",
    },
    cancelButton: {
        marginTop: 20,
        backgroundColor: "#374151",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },

    cancelText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

    countdownText: {
        fontSize: 70,
        fontWeight: "bold",
        color: "#EF4444",
        marginBottom: 20,
    },
});