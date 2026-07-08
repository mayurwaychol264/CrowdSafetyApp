import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../firebase/config';

import {
    doc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';

export default function LocationScreen() {
    const [location, setLocation] = useState(null);

    useEffect(() => {

        let subscription;

        (async () => {

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                return;
            }

            subscription =
                await Location.watchPositionAsync(

                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 3000,
                        distanceInterval: 5,
                    },

                    async (newLocation) => {



                        setLocation(newLocation);

                        const user = auth.currentUser;

                        if (user) {

                            await setDoc(
                                doc(db, "locations", user.uid),
                                {
                                    userId: user.uid,
                                    latitude: newLocation.coords.latitude,
                                    longitude: newLocation.coords.longitude,
                                    updatedAt: serverTimestamp(),
                                    email: user.email,
                                }
                            );

                        }

                    }
                );

        })();

        return () => {

            if (subscription) {
                subscription.remove();
            }

        };

    }, []);
    if (!location) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
        >
            <Marker
                coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                }}
                title="You are here"
            />
        </MapView>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});