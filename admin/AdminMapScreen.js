import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button, Linking } from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { auth, db } from '../firebase/config';

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

            <View style={styles.dashboard}>

                <Text style={styles.card}>
                    👥 Users : {users.length}
                </Text>

                <Text style={styles.card}>
                    🟢 Active : {users.length}
                </Text>

                <Text style={styles.card}>
                    🚨 SOS : {sosAlerts.length}
                </Text>

            </View>

            <View style={styles.sosPanel}>

                <Text style={styles.sosTitle}>
                    🚨 LIVE SOS ALERTS
                </Text>

                {sosAlerts.length === 0 ? (

                    <Text style={styles.noSos}>
                        No Active SOS
                    </Text>

                ) : (

                    sosAlerts.map((alert) => (

                        <View key={alert.id} style={styles.alertCard}>

                            <Text style={styles.alertText}>
                                👤 {alert.email}
                            </Text>

                            <Text style={styles.alertText}>
                                📍 Latitude : {alert.latitude ? alert.latitude.toFixed(5) : "Not Available"}
                            </Text>

                            <Text style={styles.alertText}>
                                📍 Longitude : {alert.longitude ? alert.longitude.toFixed(5) : "Not Available"}
                            </Text>

                            <Text style={styles.alertText}>
                                🚨 Status : {alert.status}
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

                            <Button
                                title="🧭 Navigate"
                                onPress={() => {
                                    Linking.openURL(
                                        `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
                                    );
                                }}
                            />

                            <Button
                                title="✅ Resolve SOS"
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
                                        console.log("Resolve Error:", error);
                                        alert("Resolve failed: " + error.message);
                                    }
                                }}
                            />
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
});