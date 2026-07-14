import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from 'react-native';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function SosHistoryScreen() {

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDateTime = (timestamp) => {
        if (!timestamp) {
            return {
                date: "Date unavailable",
                time: "",
            };
        }

        const dateObject = timestamp.toDate();

        return {
            date: dateObject.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),

            time: dateObject.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };




    const fetchHistory = async () => {
        try {
            const historyQuery = query(
                collection(db, "sosHistory"),
                where("userId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(historyQuery);

            const data = [];

            querySnapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });


            data.sort((a, b) => {

                return (
                    b.createdAt?.seconds -
                    a.createdAt?.seconds
                );

            });
            setHistory(data);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>

                <Text style={styles.title}>
                    SOS History
                </Text>

                <Text style={styles.subtitle}>
                    View all emergency alerts and their status
                </Text>

            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}

                ListEmptyComponent={

                    <View style={styles.emptyContainer}>

                        <Text style={styles.emptyIcon}>
                            🚨
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No SOS History
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Emergency alerts will appear here.
                        </Text>

                    </View>

                }

                renderItem={({ item }) => {
                    const formatted = formatDateTime(item.createdAt);

                    return (
                        <View style={styles.card}>

                            <View style={styles.cardHeader}>
                                <Text style={styles.userEmail}>
                                    👤 {item.userName || item.email}
                                </Text>

                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                item.status === "Resolved"
                                                    ? "#DCFCE7"
                                                    : "#FEE2E2",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            {
                                                color:
                                                    item.status === "Resolved"
                                                        ? "#15803D"
                                                        : "#DC2626",
                                            },
                                        ]}
                                    >
                                        {item.status?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.historyInfo}>
                                🚨 Emergency Alert
                            </Text>

                            <Text style={styles.historyInfo}>
                                📅 {formatted.date}
                            </Text>

                            <Text style={styles.historyInfo}>
                                🕒 {formatted.time}
                            </Text>

                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={() => {
                                    if (
                                        item.latitude == null ||
                                        item.longitude == null
                                    ) {
                                        return;
                                    }

                                    Linking.openURL(
                                        `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
                                    );
                                }}
                            >
                                <Text style={styles.locationButtonText}>
                                    📍 View Location
                                </Text>
                            </TouchableOpacity>

                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    header: {
        marginTop: 20,
        marginBottom: 20,
    },

    subtitle: {
        color: "#6B7280",
        fontSize: 15,
        marginTop: 8,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 80,
    },

    emptyIcon: {
        fontSize: 60,
    },

    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 15,
    },

    emptySubtitle: {
        color: "#6B7280",
        marginTop: 8,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    userEmail: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1F2937",
        flex: 1,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    badgeText: {
        fontWeight: "bold",
    },

    historyInfo: {
        fontSize: 15,
        color: "#4B5563",
        marginTop: 6,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 15,
        elevation: 5,
    },
    locationButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 15,
    },

    locationButtonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 15,
    },

});