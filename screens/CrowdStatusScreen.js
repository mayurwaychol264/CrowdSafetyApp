import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

import { auth, db } from '../firebase/config';

import {
    collection,
    onSnapshot,
} from 'firebase/firestore';

export default function CrowdStatusScreen() {

    const [currentLocation, setCurrentLocation] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const [allSOS, setAllSOS] = useState([]);

    const [nearbyUsers, setNearbyUsers] = useState(0);
    const [nearbySOS, setNearbySOS] = useState(0);

    const [loading, setLoading] = useState(true);
    const [crowdLevel, setCrowdLevel] = useState("Low");
    const [recommendation, setRecommendation] =
        useState("Area looks safe");
    const getDistanceInMeters = (
        lat1,
        lon1,
        lat2,
        lon2
    ) => {
        const earthRadius = 6371000;

        const toRadians = (degree) =>
            degree * (Math.PI / 180);

        const latitudeDifference =
            toRadians(lat2 - lat1);

        const longitudeDifference =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(latitudeDifference / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(longitudeDifference / 2) ** 2;

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    };



    useEffect(() => {
        const getCurrentLocation = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    setLoading(false);
                    return;
                }

                const location =
                    await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });

                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.log('Location Error:', error);
                setLoading(false);
            }
        };

        getCurrentLocation();
    }, []);



    useEffect(() => {
        const unsubscribeLocations = onSnapshot(
            collection(db, "locations"),
            (snapshot) => {
                const locationData = [];

                snapshot.forEach((document) => {
                    locationData.push({
                        id: document.id,
                        ...document.data(),
                    });
                });

                setAllLocations(locationData);
            },
            (error) => {
                console.log("Locations Listener Error:", error);
            }
        );

        const unsubscribeSOS = onSnapshot(
            collection(db, "activeSOS"),
            (snapshot) => {
                const sosData = [];

                snapshot.forEach((document) => {
                    sosData.push({
                        id: document.id,
                        ...document.data(),
                    });
                });

                setAllSOS(sosData);
            },
            (error) => {
                console.log("SOS Listener Error:", error);
            }
        );

        return () => {
            unsubscribeLocations();
            unsubscribeSOS();
        };
    }, []);


    useEffect(() => {
        if (!currentLocation) {
            return;
        }

        const radiusInMeters = 500;

        const nearbyLocationData = allLocations.filter(
            (item) => {
                if (
                    item.latitude == null ||
                    item.longitude == null
                ) {
                    return false;
                }

                // Current logged-in user ko crowd count me include nahi karna
                if (item.id === auth.currentUser?.uid) {
                    return false;
                }

                const distance = getDistanceInMeters(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    item.latitude,
                    item.longitude
                );

                return distance <= radiusInMeters;
            }
        );

        const nearbySOSData = allSOS.filter((item) => {
            if (
                item.latitude == null ||
                item.longitude == null
            ) {
                return false;
            }

            const distance = getDistanceInMeters(
                currentLocation.latitude,
                currentLocation.longitude,
                item.latitude,
                item.longitude
            );

            return distance <= radiusInMeters;
        });

        const userCount = nearbyLocationData.length;
        const sosCount = nearbySOSData.length;

        setNearbyUsers(userCount);
        setNearbySOS(sosCount);

        if (nearbyUsers <= 5 && nearbySOS === 0) {

            setCrowdLevel("Low");
            setRecommendation("Area looks safe.");

        }
        else if (
            nearbyUsers <= 15 ||
            (nearbySOS >= 1 && nearbySOS <= 2)
        ) {

            setCrowdLevel("Medium");
            setRecommendation("Stay alert in this area.");

        }
        else {

            setCrowdLevel("High");
            setRecommendation("Avoid the crowded area if possible.");

        }

        setLoading(false);
    }, [currentLocation, allLocations, allSOS]);

    useEffect(() => {
        const unsubscribeLocations = onSnapshot(
            collection(db, 'locations'),
            (snapshot) => {
                const data = [];

                snapshot.forEach((document) => {
                    data.push({
                        id: document.id,
                        ...document.data(),
                    });
                });

                setAllLocations(data);
            }
        );

        const unsubscribeSOS = onSnapshot(
            collection(db, 'activeSOS'),
            (snapshot) => {
                const data = [];

                snapshot.forEach((document) => {
                    data.push({
                        id: document.id,
                        ...document.data(),
                    });
                });

                setAllSOS(data);
            }
        );

        return () => {
            unsubscribeLocations();
            unsubscribeSOS();
        };
    }, []);

    console.log("Current Location:", currentLocation);
    console.log("All Locations:", allLocations.length);
    console.log("All SOS:", allSOS.length);

    return (
        <View style={styles.container}>

            <View style={styles.header}>

                <Text style={styles.title}>
                    Crowd Status
                </Text>

                <Text style={styles.subtitle}>
                    Live safety around your current location
                </Text>

            </View>

            <View style={styles.statusCard}>

                <Text style={styles.levelTitle}>
                    Crowd Level
                </Text>

                <Text
                    style={[
                        styles.levelText,
                        crowdLevel === "High"
                            ? { color: "#DC2626" }
                            : crowdLevel === "Medium"
                                ? { color: "#D97706" }
                                : { color: "#16A34A" }
                    ]}
                >
                    {crowdLevel}
                </Text>

            </View>

            <View style={styles.statsContainer}>

                <View style={styles.smallCard}>

                    <Text style={styles.cardNumber}>
                        {nearbyUsers}
                    </Text>

                    <Text style={styles.cardLabel}>
                        Nearby Users
                    </Text>

                </View>

                <View style={styles.smallCard}>

                    <Text style={styles.cardNumber}>
                        {nearbySOS}
                    </Text>

                    <Text style={styles.cardLabel}>
                        Active SOS
                    </Text>

                </View>

            </View>

            <View style={styles.radiusCard}>

                <Text style={styles.radiusTitle}>
                    Detection Radius
                </Text>

                <Text style={styles.radiusValue}>
                    500 meters
                </Text>

            </View>

            <View style={styles.recommendationCard}>

                <Text style={styles.recommendationTitle}>
                    Recommendation
                </Text>

                <Text style={styles.recommendationText}>
                    {recommendation}
                </Text>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },

    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 4,
    },

    place: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    low: {
        color: 'green',
        fontSize: 18,
        fontWeight: 'bold',
    },

    medium: {
        color: 'orange',
        fontSize: 18,
        fontWeight: 'bold',
    },

    high: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        marginTop: 50,
        marginBottom: 25,
    },

    subtitle: {
        color: "#6B7280",
        fontSize: 15,
        marginTop: 8,
    },

    statusCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },

    levelTitle: {
        fontSize: 18,
        color: "#6B7280",
    },

    levelText: {
        fontSize: 38,
        fontWeight: "bold",
        marginTop: 10,
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    smallCard: {
        backgroundColor: "#fff",
        width: "48%",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },

    cardNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2563EB",
    },

    cardLabel: {
        marginTop: 10,
        color: "#6B7280",
        fontSize: 15,
    },

    radiusCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        alignItems: "center",
        elevation: 5,
    },

    radiusTitle: {
        color: "#6B7280",
        fontSize: 16,
    },

    radiusValue: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 8,
        color: "#2563EB",
    },

    recommendationCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        elevation: 5,
    },

    recommendationTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    recommendationText: {
        marginTop: 10,
        fontSize: 16,
        color: "#374151",
    },
});