import React from 'react';
import * as Location from 'expo-location';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

import { auth, db } from '../firebase/config';
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    doc,
    setDoc,
} from 'firebase/firestore';
export default function SosScreen() {

    const handleSOS = async () => {
        try {

            const user = auth.currentUser;

            let { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required'
                );
                return;
            }

            let currentLocation =
                await Location.getCurrentPositionAsync({});
            const contactsSnapshot = await getDocs(
                collection(
                    db,
                    'users',
                    user.uid,
                    'emergencyContacts'
                )
            );

            const emergencyContacts = [];

            contactsSnapshot.forEach((doc) => {
                emergencyContacts.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            const historyRef = await addDoc(collection(db, 'sosHistory'), {

                userId: user.uid,

                email: user.email,

                userName: user.displayName || "Unknown",

                latitude: currentLocation.coords.latitude,

                longitude: currentLocation.coords.longitude,

                status: "Active",

                createdAt: serverTimestamp(),
                emergencyContacts: emergencyContacts,
            });

            await setDoc(doc(db, 'activeSOS', user.uid), {

                userId: user.uid,

                email: user.email,

                userName: user.displayName || "Unknown",

                latitude: currentLocation.coords.latitude,

                longitude: currentLocation.coords.longitude,

                status: "Active",

                createdAt: serverTimestamp(),

                emergencyContacts: emergencyContacts,

                historyId: historyRef.id,
            });

            Alert.alert(
                '🚨 EMERGENCY ALERT',
                'SOS Alert Sent Successfully!'
            );

        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Emergency SOS
            </Text>

            <TouchableOpacity
                style={styles.sosButton}
                onPress={handleSOS}
            >
                <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>

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
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 40,
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
        marginTop: 30,
        fontSize: 16,
        color: 'gray',
    },
});