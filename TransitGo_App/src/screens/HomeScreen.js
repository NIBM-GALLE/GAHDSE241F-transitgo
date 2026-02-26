import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
    const user = auth.currentUser;
    const [stats, setStats] = useState({
        totalSchedules: 0,
        myBookings: 0,
        myPayments: 0,
    });
    const [upcomingSchedules, setUpcomingSchedules] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Total schedules
            const schedSnap = await getDocs(collection(db, "schedules"));
            const allSchedules = schedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setStats((s) => ({ ...s, totalSchedules: allSchedules.length }));

            // Get upcoming (sorted by date)
            const today = new Date().toISOString().split("T")[0];
            const upcoming = allSchedules
                .filter((s) => s.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
                .slice(0, 3);
            setUpcomingSchedules(upcoming);

            // My bookings
            if (user) {
                try {
                    const bookSnap = await getDocs(
                        query(collection(db, "bookings"), where("userId", "==", user.uid))
                    );
                    setStats((s) => ({ ...s, myBookings: bookSnap.size }));
                } catch (_) { }

                // My payments
                try {
                    const paySnap = await getDocs(
                        query(collection(db, "payments"), where("userId", "==", user.uid))
                    );
                    setStats((s) => ({ ...s, myPayments: paySnap.size }));
                } catch (_) { }
            }
        } catch (err) {
            console.log("Error fetching home data:", err);
        }
    };

    const quickActions = [
        {
            icon: "calendar-outline",
            title: "Schedules",
            subtitle: "View bus times",
            color: "#27ae60",
            screen: "Schedules",
        },
        {
            icon: "qr-code-outline",
            title: "QR Pay",
            subtitle: "Scan & pay",
            color: "#3b82f6",
            screen: "QRPay",
        },
        {
            icon: "ticket-outline",
            title: "Book Ticket",
            subtitle: "Reserve a seat",
            color: "#8b5cf6",
            screen: "BookTicket",
        },
        {
            icon: "person-outline",
            title: "Profile",
            subtitle: "Your account",
            color: "#f59e0b",
            screen: "Profile",
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={["#0f2027", "#203a43", "#2c5364"]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                        <View>
                            <Text style={styles.greeting}>Hello,</Text>
                            <Text style={styles.userName}>
                                {user?.displayName || "Traveler"} 👋
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <Ionicons name="person-circle" size={42} color="#16c98d" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: "#ecfdf5" }]}>
                        <Ionicons name="calendar" size={24} color="#27ae60" />
                        <Text style={styles.statNumber}>{stats.totalSchedules}</Text>
                        <Text style={styles.statLabel}>Schedules</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#eff6ff" }]}>
                        <Ionicons name="ticket" size={24} color="#3b82f6" />
                        <Text style={styles.statNumber}>{stats.myBookings}</Text>
                        <Text style={styles.statLabel}>My Bookings</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#faf5ff" }]}>
                        <Ionicons name="card" size={24} color="#8b5cf6" />
                        <Text style={styles.statNumber}>{stats.myPayments}</Text>
                        <Text style={styles.statLabel}>Payments</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.actionCard}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    { backgroundColor: action.color + "18" },
                                ]}
                            >
                                <Ionicons name={action.icon} size={26} color={action.color} />
                            </View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Upcoming Schedules */}
                <Text style={styles.sectionTitle}>Upcoming Schedules</Text>
                {upcomingSchedules.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
                        <Text style={styles.emptyText}>No upcoming schedules</Text>
                    </View>
                ) : (
                    upcomingSchedules.map((sched, idx) => (
                        <View key={idx} style={styles.scheduleCard}>
                            <View style={styles.scheduleLeft}>
                                <View style={styles.schedDot} />
                                <View>
                                    <Text style={styles.schedBus}>
                                        🚌 {sched.busNumber || "Bus"}
                                    </Text>
                                    <Text style={styles.schedRoute}>
                                        Route {sched.routeNumber || "-"} → {sched.destination || "-"}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.scheduleRight}>
                                <Text style={styles.schedDate}>{sched.date}</Text>
                                <Text style={styles.schedTime}>{sched.time}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f5f9" },
    header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24 },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerLogo: {
        width: 42,
        height: 42,
    },
    greeting: { fontSize: 16, color: "rgba(255,255,255,0.6)" },
    userName: { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 2 },
    profileBtn: { padding: 4 },
    content: { flex: 1, paddingHorizontal: 20, marginTop: -5 },
    statsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 6,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    statNumber: { fontSize: 22, fontWeight: "800", color: "#1e293b" },
    statLabel: { fontSize: 11, color: "#64748b", fontWeight: "600" },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 14,
    },
    actionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 28,
    },
    actionCard: {
        width: (width - 52) / 2,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    actionTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    actionSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        gap: 8,
    },
    emptyText: { fontSize: 14, color: "#94a3b8" },
    scheduleCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    scheduleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    schedDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#27ae60",
    },
    schedBus: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    schedRoute: { fontSize: 12, color: "#64748b", marginTop: 2 },
    scheduleRight: { alignItems: "flex-end" },
    schedDate: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
    schedTime: { fontSize: 12, color: "#27ae60", fontWeight: "600", marginTop: 2 },
});

export default HomeScreen;
