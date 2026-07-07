import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';

import {
    MaterialIcons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {

    const [greeting, setGreeting] = useState('');
    const [today, setToday] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();

        if (hour < 12) {
            setGreeting('Good Morning');
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }

        const date = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });

        setToday(date);
    }, []);
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.header}>
                <Text style={styles.welcome}>
                    👋 {greeting}, Mayur
                </Text>

                <Text style={styles.subtitle}>
                    Stay Safe • Stay Connected
                </Text>

                <Text style={styles.dateText}>
                    {today}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.sosCard}
                onPress={() => navigation.navigate('SOS')}
            >

                <MaterialCommunityIcons
                    name="alarm-light"
                    size={50}
                    color="white"
                />

                <Text style={styles.sosTitle}>
                    Emergency SOS
                </Text>

                <Text style={styles.sosSubtitle}>
                    One Tap Emergency Help
                </Text>
            </TouchableOpacity>
            <View style={styles.grid}>

                <TouchableOpacity
                    style={styles.smallCard}
                    onPress={() => navigation.navigate('Location')}
                >
                    <MaterialIcons
                        name="location-on"
                        size={40}
                        color="#1976D2"
                    />

                    <Text style={styles.cardTitle}>
                        Live Location
                    </Text>
                    <Text style={styles.cardSubtitle}>
                        Share your location
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.smallCard}
                    onPress={() => navigation.navigate('CrowdStatus')}
                >
                    <MaterialCommunityIcons
                        name="account-group"
                        size={40}
                        color="#388E3C"
                    />

                    <Text style={styles.cardTitle}>
                        Crowd Status
                    </Text>
                    <Text style={styles.cardSubtitle}>
                        Nearby crowd info
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.smallCard}
                    onPress={() => navigation.navigate('EmergencyContacts')}
                >
                    <MaterialIcons
                        name="contacts"
                        size={40}
                        color="#F57C00"
                    />

                    <Text style={styles.cardTitle}>
                        Contacts
                    </Text>
                    <Text style={styles.cardSubtitle}>
                        Trusted contacts
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.smallCard}
                    onPress={() => navigation.navigate('SOSHistory')}
                >
                    <MaterialIcons
                        name="history"
                        size={40}
                        color="#7B1FA2"
                    />

                    <Text style={styles.cardTitle}>
                        SOS History
                    </Text>
                    <Text style={styles.cardSubtitle}>
                        Previous alerts
                    </Text>
                </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={styles.profileCard}
                onPress={() => navigation.navigate('Profile')}
            >

                <MaterialCommunityIcons
                    name="account-circle"
                    size={42}
                    color="#2563EB"
                />

                <View>
                    <Text style={styles.profileText}>
                        My Profile
                    </Text>

                    <Text style={styles.profileSubtitle}>
                        Manage your account
                    </Text>
                </View>

            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
        paddingTop: 40,
    },

    header: {
        marginTop: 20,
        marginBottom: 25,
    },

    welcome: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 5,
    },
    sosCard: {
        backgroundColor: '#EF4444',
        borderRadius: 22,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 6,
    },

    sosTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
    },

    sosSubtitle: {
        color: '#FEE2E2',
        fontSize: 16,
        marginTop: 8,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    smallCard: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        marginBottom: 18,
        elevation: 5,
    },

    cardTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },

    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginTop: 10,
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    profileText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#333',
    },
    dateText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 6,
    },

    cardSubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
    profileSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 3,
    },
});