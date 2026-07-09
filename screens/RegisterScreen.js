import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';

import Logo from '../assets/images/shield-logo.png';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleRegister = async () => {
        setLoading(true);
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill all fields');

            setLoading(false);
            return;
        }
        if (password.length < 6) {
            Alert.alert(
                "Weak Password",
                "Password must be at least 6 characters."
            );

            setLoading(false);
            return;
        }

        if (phone.length !== 10) {
            Alert.alert(
                "Invalid Phone",
                "Enter a valid 10-digit phone number."
            );

            setLoading(false);
            return;
        }
        try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // Save user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                phone,
                role: "user",
                createdAt: new Date(),
            });
            setLoading(false);
            Alert.alert(
                "🎉 Registration Successful",
                "Your account has been created successfully.",
                [
                    {
                        text: "Go to Login",
                        onPress: () => navigation.navigate("Login"),
                    },
                ]
            );


        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    return (

        <View style={styles.container}>

            <View style={styles.header}>
                <Image
                    source={Logo}
                    style={styles.logo}
                />

                <Text style={styles.title}>
                    Create Account
                </Text>

                <Text style={styles.subtitle}>
                    Join Crowd Safety Today
                </Text>
            </View>


            <View style={styles.inputContainer}>

                <Ionicons
                    name="person-outline"
                    size={22}
                    color="#6B7280"
                />

                <TextInput
                    placeholder="Full Name"
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                />

            </View>
            <View style={styles.inputContainer}>

                <Ionicons
                    name="mail-outline"
                    size={22}
                    color="#6B7280"
                />

                <TextInput
                    placeholder="Email"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                />

            </View>

            <View style={styles.inputContainer}>

                <Ionicons
                    name="call-outline"
                    size={22}
                    color="#6B7280"
                />

                <TextInput
                    placeholder="Phone Number"
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="next"
                />

            </View>
            <View style={styles.passwordContainer}>

                <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#6B7280"
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                />

                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#6B7280"
                    />
                </TouchableOpacity>

            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color="#fff"
                    />
                ) : (
                    <Text style={styles.buttonText}>
                        Create Account
                    </Text>
                )}
            </TouchableOpacity>



            <TouchableOpacity


                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.loginText}>
                    Already a member?{" "}
                    <Text style={styles.loginLink}>
                        Sign In
                    </Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },

    button: {
        backgroundColor: '#0066ff',
        padding: 15,
        borderRadius: 10,
    },

    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },

    loginText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#0066ff',
        fontSize: 16,
    },

    header: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 25,
    },

    logo: {
        width: 170,
        height: 170,
        resizeMode: "contain",
        marginBottom: -10,
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#1F2937",
    },

    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        marginTop: 6,
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
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingHorizontal: 12,
        marginBottom: 15,
        elevation: 3,
        alignItems: "center",
    },

    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 10,
    },
    loginLink: {
        color: "#2563EB",
        fontWeight: "bold",
    },
    loginText: {
        marginTop: 25,
    }
});