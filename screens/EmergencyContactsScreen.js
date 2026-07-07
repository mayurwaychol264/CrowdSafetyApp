import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
} from 'react-native';

import { auth, db } from '../firebase/config';

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,

} from 'firebase/firestore';

export default function EmergencyContactsScreen() {

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relation, setRelation] = useState('');
    const [contacts, setContacts] = useState([]);
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {

            const querySnapshot = await getDocs(
                collection(
                    db,
                    'users',
                    auth.currentUser.uid,
                    'emergencyContacts'
                )
            );

            const data = [];

            querySnapshot.forEach((item) => {
                data.push({
                    id: item.id,
                    ...item.data(),
                });
            });

            setContacts(data);

        } catch (error) {
            console.log(error);
        }
    };

    const handleSave = async () => {

        if (!name || !phone || !relation) {
            Alert.alert(
                'Error',
                'Please fill all fields'
            );
            return;
        }

        try {

            await addDoc(
                collection(db, 'users', auth.currentUser.uid, 'emergencyContacts'),
                {
                    userId: auth.currentUser.uid,
                    userEmail: auth.currentUser.email,
                    contactName: name,
                    phone: phone,
                    relation: relation,
                }
            );

            Alert.alert(
                'Success',
                'Contact Saved'
            );

            setName('');
            setPhone('');
            setRelation('');

            fetchContacts();

        } catch (error) {
            Alert.alert(
                'Error',
                error.message
            );
        }
    };

    const handleDelete = async (id) => {
        try {

            await deleteDoc(
                doc(
                    db,
                    'users',
                    auth.currentUser.uid,
                    'emergencyContacts',
                    id
                )
            );
            Alert.alert(
                'Success',
                'Contact Deleted'
            );

            fetchContacts();

        } catch (error) {
            Alert.alert(
                'Error',
                error.message
            );
        }
    };


    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Emergency Contacts
            </Text>

            <TextInput
                placeholder="Contact Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TextInput
                placeholder="Relationship (Mother/Father/Friend)"
                style={styles.input}
                value={relation}
                onChangeText={setRelation}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
            >
                <Text style={styles.buttonText}>
                    Save Contact
                </Text>
            </TouchableOpacity>

            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.contactCard}>

                        <Text style={styles.contactName}>
                            {item.contactName}
                        </Text>

                        <Text style={styles.contactPhone}>
                            {item.phone}
                        </Text>
                        <Text style={styles.contactPhone}>
                            Relation: {item.relation}
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Text style={styles.deleteText}>
                                Delete
                            </Text>
                        </TouchableOpacity>

                    </View>
                )}
            />

        </View>
    );

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },

    button: {
        backgroundColor: '#0066ff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },

    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },

    contactCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },

    contactName: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    contactPhone: {
        fontSize: 16,
        color: 'gray',
        marginTop: 5,
    },

    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },

    deleteText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

