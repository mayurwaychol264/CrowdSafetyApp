import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './firebase/config';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import LocationScreen from './screens/LocationScreen';
import SosScreen from './screens/SosScreen';
import CrowdStatusScreen from './screens/CrowdStatusScreen';
import ProfileScreen from './screens/ProfileScreen';
import SosHistoryScreen from './screens/SosHistoryScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import AdminMapScreen from './admin/AdminMapScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen name="Location"
          component={LocationScreen} />

        <Stack.Screen name="SOS"
          component={SosScreen} />

        <Stack.Screen name="CrowdStatus"
          component={CrowdStatusScreen} />

        <Stack.Screen name="Profile"
          component={ProfileScreen} />


        <Stack.Screen
          name="SOSHistory"
          component={SosHistoryScreen}
        />

        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
        />


        <Stack.Screen
          name="AdminMap"
          component={AdminMapScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}