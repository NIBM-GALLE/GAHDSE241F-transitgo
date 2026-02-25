import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import SchedulesScreen from "../screens/SchedulesScreen";
import QRPayScreen from "../screens/QRPayScreen";
import BookTicketScreen from "../screens/BookTicketScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
    Home: { active: "home", inactive: "home-outline" },
    Schedules: { active: "calendar", inactive: "calendar-outline" },
    QRPay: { active: "qr-code", inactive: "qr-code-outline" },
    BookTicket: { active: "ticket", inactive: "ticket-outline" },
    Profile: { active: "person", inactive: "person-outline" },
};

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = tabIcons[route.name];
                    const iconName = focused ? icons.active : icons.inactive;

                    if (route.name === "QRPay") {
                        return (
                            <View style={styles.qrTabIcon}>
                                <Ionicons name={iconName} size={26} color="#fff" />
                            </View>
                        );
                    }

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
                tabBarActiveTintColor: "#27ae60",
                tabBarInactiveTintColor: "#94a3b8",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
            <Tab.Screen name="Schedules" component={SchedulesScreen} options={{ tabBarLabel: "Schedules" }} />
            <Tab.Screen
                name="QRPay"
                component={QRPayScreen}
                options={{
                    tabBarLabel: "QR Pay",
                    tabBarLabelStyle: { fontSize: 11, fontWeight: "600", color: "#27ae60" },
                }}
            />
            <Tab.Screen name="BookTicket" component={BookTicketScreen} options={{ tabBarLabel: "Book" }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
        </Tab.Navigator>
    );
}

export function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
}

export function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    qrTabIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#27ae60",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#27ae60",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
});
