
import React, { useEffect, useRef, useState } from 'react';

import {
    StyleSheet,
    View,
    Text,
    Linking,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';

import MapView, {
    Marker,
    PROVIDER_GOOGLE,
} from 'react-native-maps';

import { auth, db } from '../firebase/config';

import { Ionicons } from '@expo/vector-icons';

import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    query,
    where,
} from 'firebase/firestore';


const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:5000";


export default function AdminMapScreen() {

    // =========================
    // STATES
    // =========================

    // Registered users
    const [users, setUsers] = useState([]);

    // Active SOS alerts
    const [sosAlerts, setSosAlerts] = useState([]);

    // Live location data
    const [liveLocations, setLiveLocations] = useState([]);

    // Admin permission
    const [isAdmin, setIsAdmin] = useState(false);

    const [checkingRole, setCheckingRole] =
        useState(true);

    const mapRef = useRef(null);


    // =========================
    // CHECK ADMIN ROLE
    // =========================

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

                if (
                    userDoc.exists() &&
                    userDoc.data().role === "admin"
                ) {

                    setIsAdmin(true);

                } else {

                    setIsAdmin(false);

                }

                setCheckingRole(false);

            } catch (error) {

                console.error(
                    "Admin role error:",
                    error
                );

                setIsAdmin(false);
                setCheckingRole(false);

            }

        };

        checkAdminRole();

    }, []);


    // =========================
    // GET ALL USERS
    // =========================
    // Purpose:
    // Total Users count only.
    // DO NOT use this data for map.

    useEffect(() => {

        if (!isAdmin) return;

        const unsubscribe = onSnapshot(

            collection(db, "users"),

            (snapshot) => {

                const userData =
                    snapshot.docs

                        .map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))

                        .filter(
                            (user) =>
                                user.role === "user"
                        );

                console.log(
                    "👥 TOTAL USERS:",
                    userData.length
                );

                setUsers(userData);

            },

            (error) => {

                console.error(
                    "Users listener error:",
                    error
                );

            }

        );

        return () => unsubscribe();

    }, [isAdmin]);


    // =========================
    // GET ACTIVE SOS
    // =========================

    useEffect(() => {

        if (!isAdmin) return;

        const sosQuery = query(

            collection(db, "activeSOS"),

            where(
                "status",
                "==",
                "Active"
            )

        );

        const unsubscribe = onSnapshot(

            sosQuery,

            (snapshot) => {

                const data = [];

                snapshot.forEach((doc) => {

                    console.log(
                        "🔥 ACTIVE SOS DATA:",
                        doc.id,
                        doc.data()
                    );

                    data.push({
                        id: doc.id,
                        ...doc.data(),
                    });

                });

                console.log(
                    "🔥 ACTIVE SOS COUNT:",
                    data.length
                );

                setSosAlerts(data);

            },

            (error) => {

                console.error(
                    "Active SOS listener error:",
                    error
                );

            }

        );

        return () => unsubscribe();

    }, [isAdmin]);


    // =========================
    // GET LIVE LOCATIONS
    // =========================
    // This collection contains:
    // email
    // latitude
    // longitude
    // updatedAt

    useEffect(() => {

        if (!isAdmin) return;

        const unsubscribe = onSnapshot(

            collection(db, "liveLocations"),

            (snapshot) => {

                const locationData =
                    snapshot.docs.map((doc) => ({

                        id: doc.id,
                        ...doc.data(),

                    }));

                console.log(
                    "📍 LIVE LOCATIONS:",
                    locationData.length
                );

                setLiveLocations(locationData);

            },

            (error) => {

                console.error(
                    "Live locations listener error:",
                    error
                );

            }

        );

        return () => unsubscribe();

    }, [isAdmin]);


    // =========================
    // ACTIVE LOCATION COUNT
    // =========================
    // A location is considered active
    // if updated within last 5 minutes.

    const now = Date.now();

    const activeLiveLocations =
        liveLocations.filter((location) => {

            if (!location.updatedAt) {
                return false;
            }

            try {

                const updatedTime =
                    location.updatedAt.toDate
                        ? location.updatedAt.toDate().getTime()
                        : new Date(
                            location.updatedAt
                        ).getTime();

                return (
                    now - updatedTime
                    <= 5 * 60 * 1000
                );

            } catch (error) {

                return false;

            }

        });


    // =========================
    // MAP AUTO FOCUS
    // =========================

    useEffect(() => {

        if (
            liveLocations.length > 0 &&
            mapRef.current
        ) {

            const firstLocation =
                liveLocations[0];

            if (
                typeof firstLocation.latitude ===
                "number" &&
                typeof firstLocation.longitude ===
                "number"
            ) {

                mapRef.current.animateToRegion(

                    {
                        latitude:
                            firstLocation.latitude,

                        longitude:
                            firstLocation.longitude,

                        latitudeDelta: 0.01,

                        longitudeDelta: 0.01,
                    },

                    1000

                );

            }

        }

    }, [liveLocations]);


    // =========================
    // CHECKING ADMIN
    // =========================

    if (checkingRole) {

        return (

            <View style={styles.centerContainer}>

                <Text>
                    Checking permissions...
                </Text>

            </View>

        );

    }


    // =========================
    // ACCESS DENIED
    // =========================

    if (!isAdmin) {

        return (

            <View style={styles.centerContainer}>

                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: "bold",
                        color: "red",
                    }}
                >
                    ⛔ Access Denied
                </Text>

                <Text
                    style={{
                        marginTop: 10,
                    }}
                >
                    Only Admin can access this page.
                </Text>

            </View>

        );

    }


    // =========================
    // MAIN UI
    // =========================

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={{
                paddingBottom: 30,
            }}
        >

            {/* =========================
                HEADER
            ========================= */}

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


            {/* =========================
                STATISTICS
            ========================= */}

            <View style={styles.statsContainer}>


                {/* TOTAL USERS */}

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


                {/* ACTIVE USERS */}

                <View style={styles.statCard}>

                    <Ionicons
                        name="radio-button-on-outline"
                        size={32}
                        color="#10B981"
                    />

                    <Text style={styles.statNumber}>
                        {activeLiveLocations.length}
                    </Text>

                    <Text style={styles.statLabel}>
                        Active
                    </Text>

                </View>


                {/* ACTIVE SOS */}

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


            {/* =========================
                SOS PANEL
            ========================= */}

            <View style={styles.sosPanel}>


                <View style={styles.panelHeader}>

                    <Text style={styles.panelTitle}>
                        🚨 Active SOS Alerts
                    </Text>

                    <Text style={styles.panelCount}>
                        {sosAlerts.length}
                    </Text>

                </View>


                {/* NO ACTIVE SOS */}

                {sosAlerts.length === 0 ? (

                    <Text style={styles.noSos}>
                        No Active SOS
                    </Text>

                ) : (

                    /* ACTIVE SOS LIST */

                    sosAlerts.map((alert) => (

                        <View
                            key={alert.id}
                            style={styles.alertCard}
                        >


                            {/* ALERT HEADER */}

                            <View
                                style={
                                    styles.alertHeader
                                }
                            >

                                <View>

                                    <Text
                                        style={
                                            styles.alertUser
                                        }
                                    >
                                        👤 {alert.email}
                                    </Text>

                                    <Text
                                        style={
                                            styles.alertStatus
                                        }
                                    >
                                        🚨 {alert.status}
                                    </Text>

                                </View>


                                <View
                                    style={
                                        styles.statusBadge
                                    }
                                >

                                    <Text
                                        style={
                                            styles.badgeText
                                        }
                                    >
                                        ACTIVE
                                    </Text>

                                </View>

                            </View>


                            {/* STATUS */}

                            <Text
                                style={
                                    styles.alertText
                                }
                            >
                                🚨 Status :{" "}
                                {alert.status}
                            </Text>


                            {/* LOCATION */}

                            <Text
                                style={
                                    styles.locationAvailable
                                }
                            >
                                📍 Live Location Available
                            </Text>


                            {/* EMERGENCY CONTACTS */}

                            {alert.emergencyContacts &&
                                alert.emergencyContacts
                                    .length > 0 && (

                                    <View
                                        style={{
                                            marginTop: 8,
                                        }}
                                    >

                                        <Text
                                            style={
                                                styles.alertText
                                            }
                                        >
                                            📞 Emergency Contacts:
                                        </Text>

                                        {alert
                                            .emergencyContacts
                                            .map(
                                                (
                                                    contact,
                                                    index
                                                ) => (

                                                    <Text
                                                        key={
                                                            index
                                                        }
                                                        style={
                                                            styles.alertText
                                                        }
                                                    >
                                                        {
                                                            contact.relation
                                                        }
                                                        :{" "}
                                                        {
                                                            contact.contactName
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            contact.phone
                                                        }
                                                    </Text>

                                                )
                                            )}

                                    </View>

                                )}


                            {/* NAVIGATE */}

                            <TouchableOpacity
                                style={
                                    styles.navigateButton
                                }
                                onPress={() => {

                                    Linking.openURL(

                                        `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`

                                    );

                                }}
                            >

                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    🧭 Navigate
                                </Text>

                            </TouchableOpacity>


                            {/* RESOLVE SOS */}

                            <TouchableOpacity
                                style={
                                    styles.resolveButton
                                }
                                onPress={async () => {

                                    try {

                                        const user =
                                            auth.currentUser;

                                        if (!user) {

                                            Alert.alert(
                                                "Error",
                                                "Admin is not logged in."
                                            );

                                            return;

                                        }


                                        const idToken =
                                            await user.getIdToken(
                                                true
                                            );


                                        const response =
                                            await fetch(

                                                `${API_BASE_URL}/api/sos/${alert.userId}/resolve`,

                                                {
                                                    method:
                                                        "PATCH",

                                                    headers:
                                                    {
                                                        "Content-Type":
                                                            "application/json",

                                                        Authorization:
                                                            `Bearer ${idToken}`,
                                                    },
                                                }

                                            );


                                        const data =
                                            await response.json();


                                        if (
                                            !response.ok
                                        ) {

                                            throw new Error(

                                                data.message ||
                                                "Failed to resolve SOS"

                                            );

                                        }


                                        Alert.alert(
                                            "SOS Resolved",
                                            "Emergency SOS resolved successfully."
                                        );


                                        // IMPORTANT:
                                        // Do NOT manually remove the SOS here.
                                        // Firestore listener will automatically
                                        // remove it when status changes.

                                    } catch (error) {

                                        console.error(
                                            "Resolve SOS error:",
                                            error
                                        );

                                        Alert.alert(
                                            "Resolve Failed",
                                            error.message
                                        );

                                    }

                                }}
                            >

                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    ✅ Resolve SOS
                                </Text>

                            </TouchableOpacity>


                        </View>

                    ))

                )}

            </View>


            {/* =========================
                MAP
            ========================= */}

            <View style={styles.mapContainer}>

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

                    {/* IMPORTANT:
                        MAP USES liveLocations
                        NOT users
                    */}

                    {liveLocations.map(
                        (location) => {

                            if (
                                typeof location.latitude !==
                                "number" ||
                                typeof location.longitude !==
                                "number"
                            ) {

                                return null;

                            }


                            const hasActiveSOS =
                                sosAlerts.some(
                                    (alert) =>
                                        alert.email ===
                                        location.email
                                );


                            return (

                                <Marker
                                    key={
                                        location.id
                                    }

                                    coordinate={{
                                        latitude:
                                            location.latitude,

                                        longitude:
                                            location.longitude,
                                    }}

                                    title={
                                        location.email
                                    }

                                    description={`📍 Latitude: ${location.latitude.toFixed(5)}
📍 Longitude: ${location.longitude.toFixed(5)}
${hasActiveSOS
                                            ? "🚨 Active SOS"
                                            : "🟢 Location Available"
                                        }`}

                                    pinColor={
                                        hasActiveSOS
                                            ? "red"
                                            : "green"
                                    }

                                />

                            );

                        }
                    )}

                </MapView>

            </View>


        </ScrollView>

    );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },


    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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


    sosPanel: {
        backgroundColor: "#fff",
        padding: 15,
        alignItems: "center",
    },


    panelHeader: {
        width: "100%",
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


    mapContainer: {
        height: 450,
        marginTop: 20,
    },


    map: {
        width: "100%",
        height: "100%",
    },

});

