import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
        <View style={styles.container}>

            <Text style={styles.title}>Profile</Text>

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
            <Text style={styles.value}>{role}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>Logout</Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#0066ff' }]}
                    onPress={handleUpdateProfile}
                >
                    <Text style={styles.buttonText}>
                        Save Changes
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 40,
    },

    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
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