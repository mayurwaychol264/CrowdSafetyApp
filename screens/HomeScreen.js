import React from 'react';
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
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.header}>

                <Text style={styles.welcome}>
                    👋 Welcome
                </Text>

                <Text style={styles.title}>
                    Crowd Safety Dashboard
                </Text>

                <Text style={styles.subtitle}>
                    Stay Safe • Stay Alert
                </Text>

            </View>

            <TouchableOpacity
                style={styles.sosCard}
                onPress={() => navigation.navigate('SOS')}
            >

                <MaterialIcons
                    name="warning"
                    size={45}
                    color="white"
                />

                <Text style={styles.sosTitle}>
                    EMERGENCY SOS
                </Text>

                <Text style={styles.sosSubtitle}>
                    Tap instantly during emergency
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
                </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={styles.profileCard}
                onPress={() => navigation.navigate('Profile')}
            >

                <MaterialIcons
                    name="person"
                    size={35}
                    color="#0066ff"
                />

                <Text style={styles.profileText}>
                    Profile
                </Text>

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
        fontSize: 20,
        color: '#666',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 5,
    },

    subtitle: {
        fontSize: 15,
        color: '#777',
        marginTop: 5,
    },

    sosCard: {
        backgroundColor: '#EF4444',
        borderRadius: 22,
        padding: 28,
        alignItems: 'center',
        elevation: 8,
        marginBottom: 25,
    },

    sosTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },

    sosSubtitle: {
        color: '#FFEAEA',
        marginTop: 6,
        fontSize: 15,
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
});