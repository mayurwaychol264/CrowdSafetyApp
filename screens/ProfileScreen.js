import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from "@expo/vector-icons";
export default function ProfileScreen({ navigation }) {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;

            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log(docSnap.data());

                    setName(docSnap.data().name);
                    setEmail(docSnap.data().email);
                    setPhone(docSnap.data().phone || '');
                    setRole(docSnap.data().role || 'User');
                } else {
                    Alert.alert('Error', 'User data not found');
                }
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    const handleUpdateProfile = async () => {
        try {
            const user = auth.currentUser;

            await updateDoc(doc(db, 'users', user.uid), {
                name: name,
                phone: phone,
            });

            Alert.alert('Success', 'Profile Updated Successfully');

        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);

            Alert.alert('Success', 'Logged Out Successfully');

            navigation.replace('Login');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.profileHeader}>
                <MaterialCommunityIcons
                    name="account-circle"
                    size={90}
                    color="#2563EB"
                />

                <Text style={styles.title}>
                    {name || "User"}
                </Text>

                <Text style={styles.emailText}>
                    {email}
                </Text>
            </View>

            <Text style={styles.label}>Name</Text>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
            <Text style={styles.label}>Phone</Text>

            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Role</Text>

            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                    {role.toUpperCase()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
            >

                <MaterialIcons
                    name="save"
                    size={22}
                    color="white"
                />

                <Text style={styles.buttonText}>
                    Save Changes
                </Text>

            </TouchableOpacity>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >

                <MaterialIcons
                    name="logout"
                    size={22}
                    color="white"
                />

                <Text style={styles.buttonText}>
                    Logout
                </Text>

            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
    },


    profileHeader: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 10,
    },

    emailText: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 4,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    saveButton: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
    },

    logoutButton: {
        backgroundColor: "#EF4444",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 40,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    roleBadge: {
        backgroundColor: "#DBEAFE",
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },

    roleText: {
        color: "#2563EB",
        fontWeight: "bold",
    },
    value: {
        fontSize: 18,
        color: '#0066ff',
        marginBottom: 20,
    },

    button: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        width: '80%',
        marginTop: 30,
    },

    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },

    input: {
        width: '80%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
});