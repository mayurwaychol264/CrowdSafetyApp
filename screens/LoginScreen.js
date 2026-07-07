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
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Image } from 'react-native';
import Logo from '../assets/images/shield-logo.png';
export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async () => {
        setLoading(true);

        if (!email || !password) {
            setLoading(false);
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        try {
            // Login user
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // Check Firestore document
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            // If document doesn't exist, create it
            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.email.split('@')[0],
                    email: user.email,
                    role: 'user',
                    createdAt: new Date(),
                });
            }

            let role = 'user';

            if (docSnap.exists()) {
                role = docSnap.data().role || 'user';
            }
            setLoading(false);
            Alert.alert('Success', 'Login Successful');

            if (role === 'admin') {
                navigation.navigate('AdminMap');
            } else {
                navigation.navigate('Home');
            }

        } catch (error) {
            setLoading(false);
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>


            <View style={styles.header}>
                <Image source={Logo} style={styles.logo} />


            </View>

            <Text style={styles.title}>
                Crowd Safety
            </Text>

            <Text style={styles.subtitle}>
                Protecting Every Life
            </Text>

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
                />
            </View>

            <View style={styles.passwordContainer}>

                <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#6B7280"
                    style={{ marginRight: 10 }}
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#6B7280"
                    />
                </TouchableOpacity>

            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color="#fff"
                    />
                ) : (
                    <Text style={styles.buttonText}>
                        Login
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    Alert.alert(
                        "Coming Soon",
                        "Forgot Password feature will be added soon."
                    );
                }}
            >
                <Text style={styles.forgotPassword}>
                    Forgot Password?
                </Text>
            </TouchableOpacity>


            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.registerText}>
                    New to Crowd Safety?{" "}
                    <Text style={styles.registerLink}>
                        Create Account
                    </Text>
                </Text>

            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 25,
        paddingTop: 70,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
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
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 18,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    registerText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#0066ff',
        fontWeight: 'bold',
    },

    subtitle: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 16,
        marginBottom: 35,
    },

    logo: {
        width: 220,
        height: 220,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: -15,
    },

    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,

        elevation: 3,
    },

    passwordInput: {
        flex: 1,
        paddingVertical: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,

        elevation: 3,
    },

    textInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 10,
    },

    forgotPassword: {
        textAlign: 'center',
        color: '#2563EB',
        marginTop: 15,
        marginBottom: 10,
        fontSize: 15,
        fontWeight: '600',
    },
    registerText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6B7280',
        fontSize: 15,
    },

    registerLink: {
        color: '#2563EB',
        fontWeight: 'bold',
    },

    version: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 13,
        marginBottom: 30,
    },
    header: {
        alignItems: "center",
        marginTop: 30,   // 👈 Sirf ye value change karke poora header upar/niche kar sakte ho
        marginBottom: 30,
    },
});