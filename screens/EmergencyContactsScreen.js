import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
    updateDoc,

} from 'firebase/firestore';

export default function EmergencyContactsScreen() {

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relation, setRelation] = useState('');
    const [contacts, setContacts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);


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
        if (contacts.length >= 5) {
            Alert.alert(
                "Limit Reached",
                "You can add a maximum of 5 emergency contacts."
            );
            return;
        }

        if (phone.length !== 10) {
            Alert.alert(
                "Invalid Phone",
                "Enter a valid 10-digit phone number."
            );
            return;
        }

        const alreadyExists = contacts.some(
            (item) => item.phone === phone
        );

        if (alreadyExists) {
            Alert.alert(
                "Duplicate Contact",
                "This phone number is already added."
            );
            return;
        }

        try {
            if (isEditing) {
                await updateDoc(
                    doc(
                        db,
                        'users',
                        auth.currentUser.uid,
                        'emergencyContacts',
                        editingId
                    ),
                    {
                        contactName: name,
                        phone,
                        relation,
                    }
                );

                Alert.alert(
                    'Success',
                    'Contact Updated Successfully'
                );
            } else {
                await addDoc(
                    collection(
                        db,
                        'users',
                        auth.currentUser.uid,
                        'emergencyContacts'
                    ),
                    {
                        userId: auth.currentUser.uid,
                        userEmail: auth.currentUser.email,
                        contactName: name,
                        phone,
                        relation,
                    }
                );

                Alert.alert(
                    'Success',
                    'Contact Saved'
                );
            }

            setName('');
            setPhone('');
            setRelation('');
            setEditingId(null);
            setIsEditing(false);

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


    const handleEdit = (contact) => {
        setName(contact.contactName);
        setPhone(contact.phone);
        setRelation(contact.relation);

        setEditingId(contact.id);
        setIsEditing(true);
    };
    return (
        <View style={styles.container}>

            <View style={styles.header}>

                <Text style={styles.title}>
                    Emergency Contacts
                </Text>

                <Text style={styles.subtitle}>
                    Keep trusted contacts for emergencies
                </Text>

            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#6B7280" />

                <TextInput
                    placeholder="Contact Name"
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={22} color="#6B7280" />

                <TextInput
                    placeholder="Phone Number"
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="heart-outline" size={22} color="#6B7280" />

                <TextInput
                    placeholder="Relationship"
                    style={styles.textInput}
                    value={relation}
                    onChangeText={setRelation}
                />
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
            >
                <Text style={styles.buttonText}>
                    {isEditing ? 'Update Contact' : 'Save Contact'}
                </Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>

                <Text style={styles.sectionTitle}>
                    Saved Contacts
                </Text>

                <Text style={styles.contactCount}>
                    {contacts.length}/5
                </Text>

            </View>

            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}

                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="people-outline"
                            size={70}
                            color="#9CA3AF"
                        />

                        <Text style={styles.emptyTitle}>
                            No Contacts Added
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Add trusted contacts for emergencies.
                        </Text>
                    </View>
                }





                renderItem={({ item }) => (
                    <View style={styles.contactCard}>

                        <View style={styles.contactTop}>

                            <View>

                                <Text style={styles.contactName}>
                                    👤 {item.contactName}
                                </Text>

                                <Text style={styles.contactRelation}>
                                    ❤️ {item.relation}
                                </Text>

                                <Text style={styles.contactPhone}>
                                    📞 {item.phone}
                                </Text>

                            </View>

                            <View style={styles.actionButtons}>

                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(item)}
                                >
                                    <Ionicons
                                        name="create-outline"
                                        size={22}
                                        color="white"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        Alert.alert(
                                            "Delete Contact",
                                            `Are you sure you want to delete ${item.contactName}?`,
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel",
                                                },
                                                {
                                                    text: "Delete",
                                                    style: "destructive",
                                                    onPress: () => handleDelete(item.id),
                                                },
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={22}
                                        color="white"
                                    />
                                </TouchableOpacity>

                            </View>





                        </View>

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

    header: {
        marginTop: 20,
        marginBottom: 25,
    },

    subtitle: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 15,
        marginTop: 8,
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

    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 15,
    },

    emptySubtitle: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 8,
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



    deleteText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },


    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 12,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
    },

    contactCount: {
        backgroundColor: "#DBEAFE",
        color: "#2563EB",
        fontWeight: "bold",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    contactTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    contactRelation: {
        fontSize: 14,
        color: "#EF4444",
        marginTop: 5,
    },


    deleteButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingHorizontal: 12,
        marginBottom: 15,
        elevation: 3,
    },

    textInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    editButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

});

