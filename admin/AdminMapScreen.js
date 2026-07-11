import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button, Linking, TouchableOpacity } from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { auth, db } from '../firebase/config';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    deleteDoc,
} from 'firebase/firestore';


export default function AdminMapScreen() {
    const [users, setUsers] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    const mapRef = useRef(null);

    useEffect(() => {

        if (!isAdmin) return;

        const unsubscribe = onSnapshot(

            collection(db, "locations"),

            (snapshot) => {

                const data = [];

                snapshot.forEach((doc) => {

                    data.push({
                        id: doc.id,
                        ...doc.data(),
                    });

                });



                setUsers(data);



            }

        );

        return () => unsubscribe();

    }, [isAdmin]);

    useEffect(() => {

        if (users.length > 0 && mapRef.current) {

            mapRef.current.animateToRegion({

                latitude: users[0].latitude,
                longitude: users[0].longitude,

                latitudeDelta: 0.01,
                longitudeDelta: 0.01,

            }, 1000);

        }

    }, [users]);


    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setIsAdmin(false);
                    setCheckingRole(false);
                    return;
                }

                const userDoc = await getDoc(
                    doc(db, "users", user.uid)
                );

                if (userDoc.exists() && userDoc.data().role === "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

                setCheckingRole(false);

            } catch (error) {
                console.log(error);
                setIsAdmin(false);
                setCheckingRole(false);
            }
        };

        checkAdminRole();
    }, []);


    useEffect(() => {

        if (!isAdmin) return;

        const unsubscribe = onSnapshot(
            collection(db, "activeSOS"),
            (snapshot) => {

                const data = [];

                snapshot.forEach((doc) => {
                    data.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });



                setSosAlerts(data);
            }
        );

        return () => unsubscribe();

    }, [isAdmin]);

    if (checkingRole) {
        return (
            <View style={styles.container}>
                <Text>Checking permissions...</Text>
            </View>
        );
    }

    if (!isAdmin) {
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: "red" }}>
                    ⛔ Access Denied
                </Text>

                <Text style={{ marginTop: 10 }}>
                    Only Admin can access this page.
                </Text>
            </View>
        );
    }

    return (

        <View style={styles.container}>

            {/* Dashboard */}

            <View style={styles.header}>

                <Text style={styles.greeting}>
                    👋 Good Evening
                </Text>

                <Text style={styles.dashboardTitle}>
                    Admin Dashboard
                </Text>

                <Text style={styles.subtitle}>
                    Live Crowd Monitoring Center
                </Text>

            </View>

            <View style={styles.statsContainer}>

                <View style={styles.statCard}>
                    <Ionicons
                        name="people-outline"
                        size={32}
                        color="#2563EB"
                    />

                    <Text style={styles.statNumber}>
                        {users.length}
                    </Text>

                    <Text style={styles.statLabel}>
                        Total Users
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons
                        name="radio-button-on-outline"
                        size={32}
                        color="#10B981"
                    />

                    <Text style={styles.statNumber}>
                        {users.length}
                    </Text>

                    <Text style={styles.statLabel}>
                        Active
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons
                        name="warning-outline"
                        size={32}
                        color="#EF4444"
                    />

                    <Text style={styles.statNumber}>
                        {sosAlerts.length}
                    </Text>

                    <Text style={styles.statLabel}>
                        Active SOS
                    </Text>
                </View>

            </View>



            <View style={styles.sosPanel}>

                <View style={styles.panelHeader}>

                    <Text style={styles.panelTitle}>
                        🚨 Active SOS Alerts
                    </Text>

                    <Text style={styles.panelCount}>
                        {sosAlerts.length}
                    </Text>

                </View>

                {sosAlerts.length === 0 ? (

                    <Text style={styles.noSos}>
                        No Active SOS
                    </Text>

                ) : (

                    sosAlerts.map((alert) => (

                        <View key={alert.id} style={styles.alertCard}>

                            <View style={styles.alertHeader}>

                                <View>
                                    <Text style={styles.alertUser}>
                                        👤 {alert.email}
                                    </Text>

                                    <Text style={styles.alertStatus}>
                                        🚨 {alert.status}
                                    </Text>
                                </View>

                                <View style={styles.statusBadge}>
                                    <Text style={styles.badgeText}>
                                        ACTIVE
                                    </Text>
                                </View>

                            </View>



                            <Text style={styles.alertText}>
                                🚨 Status : {alert.status}
                            </Text>

                            <Text style={styles.locationAvailable}>
                                📍 Live Location Available
                            </Text>

                            {alert.emergencyContacts && alert.emergencyContacts.length > 0 && (
                                <View style={{ marginTop: 8 }}>

                                    <Text style={styles.alertText}>
                                        📞 Emergency Contacts:
                                    </Text>

                                    {alert.emergencyContacts.map((contact, index) => (
                                        <Text key={index} style={styles.alertText}>
                                            {contact.relation}: {contact.contactName} - {contact.phone}
                                        </Text>
                                    ))}

                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.navigateButton}
                                onPress={() => {
                                    Linking.openURL(
                                        `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
                                    );
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    🧭 Navigate
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resolveButton}
                                onPress={async () => {
                                    try {

                                        await updateDoc(
                                            doc(db, "sosHistory", alert.historyId),
                                            {
                                                status: "Resolved",
                                            }
                                        );

                                        await deleteDoc(
                                            doc(db, "activeSOS", alert.userId)
                                        );

                                    } catch (error) {

                                        Alert.alert(
                                            "Resolve Failed",
                                            error.message
                                        );

                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    ✅ Resolve SOS
                                </Text>
                            </TouchableOpacity>

                        </View>

                    ))

                )}

            </View>


            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: 20.5937,
                    longitude: 78.9629,
                    latitudeDelta: 8,
                    longitudeDelta: 8,
                }}
            >


                {users.map((user) => (

                    <Marker
                        key={user.id}
                        coordinate={{
                            latitude: user.latitude,
                            longitude: user.longitude,
                        }}
                        title={user.email}
                        description={`📍 Latitude: ${user.latitude.toFixed(5)}
📍 Longitude: ${user.longitude.toFixed(5)}
🟢 Status: Active`}
                        pinColor={
                            sosAlerts.some((alert) => alert.email === user.email)
                                ? "red"
                                : "green"
                        }
                    />

                ))}

            </MapView>

        </View>
    );



}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },


    container: {
        flex: 1,
    },

    dashboard: {
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: "#ffffff",
        alignItems: "center",
    },

    card: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 5,
    },

    sosPanel: {
        backgroundColor: "#fff",
        padding: 15,
        alignItems: "center",
    },

    sosTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "red",
    },

    noSos: {
        marginTop: 8,
        color: "gray",
    },

    alertCard: {
        width: "95%",
        backgroundColor: "#FFE5E5",
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        borderColor: "red",
        borderWidth: 1,
    },

    alertText: {
        fontSize: 15,
        marginVertical: 2,
    },

    locationAvailable: {
        fontSize: 15,
        color: "#2563EB",
        fontWeight: "600",
        marginBottom: 10,
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginBottom: 20,
    },

    statCard: {
        width: "31%",
        backgroundColor: "#fff",
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: "center",
        elevation: 5,
    },

    statNumber: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1F2937",
        marginTop: 8,
    },

    statLabel: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 5,
    },
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

    panelTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#EF4444",
    },

    panelCount: {
        backgroundColor: "#FEE2E2",
        color: "#DC2626",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        fontWeight: "bold",
    },
    header: {
        backgroundColor: "#fff",
        marginTop: 45,
        marginHorizontal: 15,
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
        elevation: 5,
    },

    greeting: {
        fontSize: 18,
        color: "#6B7280",
    },

    dashboardTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1F2937",
        marginTop: 5,
    },

    subtitle: {
        fontSize: 15,
        color: "#6B7280",
        marginTop: 8,
    },
    alertHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    alertUser: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1F2937",
    },

    alertStatus: {
        marginTop: 5,
        color: "#DC2626",
        fontWeight: "600",
    },

    statusBadge: {
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    badgeText: {
        color: "#DC2626",
        fontWeight: "bold",
    },
    navigateButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 15,
    },

    resolveButton: {
        backgroundColor: "#10B981",
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 10,
    },

    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
    },
});