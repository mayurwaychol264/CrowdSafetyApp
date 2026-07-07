import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
} from 'react-native';

import { db } from '../firebase/config';

import {
    collection,
    onSnapshot,
} from 'firebase/firestore';

export default function CrowdStatusScreen() {
    const [crowdData, setCrowdData] = useState([]);

    useEffect(() => {

        const unsubscribe = fetchCrowdData();

        return () => unsubscribe();

    }, []);

    const fetchCrowdData = () => {

        console.log("fetchCrowdData Called");

        const unsubscribe = onSnapshot(
            collection(db, 'crowdstatus'),
            (querySnapshot) => {

                console.log("Snapshot Updated");

                const data = [];

                querySnapshot.forEach((doc) => {
                    data.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setCrowdData(data);
            }
        );

        return unsubscribe;
    };
    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Crowd Status
            </Text>

            <FlatList
                data={crowdData}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.place}>
                            {item.locationName}
                        </Text>

                        <Text
                            style={
                                item.crowdLevel === 'High'
                                    ? styles.high
                                    : item.crowdLevel === 'Medium'
                                        ? styles.medium
                                        : styles.low
                            }
                        >
                            {item.crowdLevel === 'High'
                                ? '🔴 High Crowd'
                                : item.crowdLevel === 'Medium'
                                    ? '🟡 Medium Crowd'
                                    : '🟢 Low Crowd'}
                        </Text>

                        <Text
                            style={{
                                marginTop: 8,
                                color: 'gray',
                            }}
                        >
                            Updated: {item.updatedAt}
                        </Text>

                    </View>

                )}
            />


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
});