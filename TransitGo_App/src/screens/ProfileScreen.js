import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebase";
import { signOutUser } from "../firebase/auth";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
} from "firebase/firestore";

const ProfileScreen = ({ navigation }) => {
    const user = auth.currentUser;
    const [recentPayments, setRecentPayments] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // Payments
            try {
                const paySnap = await getDocs(
                    query(collection(db, "payments"), where("userId", "==", user.uid))
                );
                const payments = paySnap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .slice(0, 5);
                setRecentPayments(payments);
            } catch (_) { }

            // Bookings
            try {
                const bookSnap = await getDocs(
                    query(collection(db, "bookings"), where("userId", "==", user.uid))
                );
                const bookings = bookSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .slice(0, 5);
                setRecentBookings(bookings);
            } catch (_) { }
        } catch (err) {
            console.log("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    await signOutUser();
                },
            },
        ]);
    };

    const joinDate = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "N/A";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={["#0f2027", "#203a43", "#2c5364"]}
                style={styles.header}
            >
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.displayName || user?.email || "U")[0].toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.displayName || "User"}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
                <View style={styles.joinBadge}>
                    <Ionicons name="calendar" size={13} color="#16c98d" />
                    <Text style={styles.joinText}>Joined {joinDate}</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="card" size={22} color="#8b5cf6" />
                        <Text style={styles.statNum}>{recentPayments.length}</Text>
                        <Text style={styles.statLabel}>Payments</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="ticket" size={22} color="#3b82f6" />
                        <Text style={styles.statNum}>{recentBookings.length}</Text>
                        <Text style={styles.statLabel}>Bookings</Text>
                    </View>
                </View>

                {/* Recent Payments */}
                <Text style={styles.sectionTitle}>Recent Payments</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#27ae60" style={{ marginVertical: 16 }} />
                ) : recentPayments.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="card-outline" size={32} color="#d1d5db" />
                        <Text style={styles.emptyText}>No payments yet</Text>
                    </View>
                ) : (
                    recentPayments.map((pay) => (
                        <View key={pay.id} style={styles.activityCard}>
                            <View style={[styles.actIcon, { backgroundColor: "#f5f3ff" }]}>
                                <Ionicons name="card" size={18} color="#8b5cf6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actTitle}>Bus {pay.busNumber}</Text>
                                <Text style={styles.actSub}>
                                    {pay.start || "N/A"} → {pay.destination || "N/A"}
                                </Text>
                            </View>
                            <View style={styles.actRight}>
                                <Text style={styles.actAmount}>Rs. {pay.amount || 0}</Text>
                                <Text style={styles.actDate}>{pay.date}</Text>
                            </View>
                        </View>
                    ))
                )}

                {/* Recent Bookings */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Bookings</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#27ae60" style={{ marginVertical: 16 }} />
                ) : recentBookings.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="ticket-outline" size={32} color="#d1d5db" />
                        <Text style={styles.emptyText}>No bookings yet</Text>
                    </View>
                ) : (
                    recentBookings.map((book) => (
                        <View key={book.id} style={styles.activityCard}>
                            <View style={[styles.actIcon, { backgroundColor: "#eff6ff" }]}>
                                <Ionicons name="ticket" size={18} color="#3b82f6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actTitle}>
                                    {book.start} → {book.destination}
                                </Text>
                                <Text style={styles.actSub}>
                                    Bus {book.busNumber} · {book.seatCount || 1} seat{(book.seatCount || 1) > 1 ? "s" : ""}
                                </Text>
                            </View>
                            <View style={styles.actRight}>
                                <Text style={styles.actAmount}>Rs. {book.totalFare || book.fare || 0}</Text>
                                <Text style={styles.actDate}>{book.date}</Text>
                            </View>
                        </View>
                    ))
                )}

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f5f9" },
    header: {
        paddingTop: 50,
        paddingBottom: 28,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    avatarWrap: { marginBottom: 12 },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#27ae60",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "rgba(22,201,141,0.4)",
    },
    avatarText: { fontSize: 30, fontWeight: "800", color: "#fff" },
    userName: { fontSize: 22, fontWeight: "800", color: "#fff" },
    userEmail: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 },
    joinBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(22,201,141,0.12)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 10,
    },
    joinText: { fontSize: 12, color: "#16c98d", fontWeight: "600" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        alignItems: "center",
        gap: 6,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    statNum: { fontSize: 24, fontWeight: "800", color: "#1e293b" },
    statLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
    sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1e293b", marginBottom: 12 },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 24,
        alignItems: "center",
        gap: 6,
    },
    emptyText: { fontSize: 13, color: "#94a3b8" },
    activityCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        elevation: 1,
    },
    actIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    actTitle: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
    actSub: { fontSize: 12, color: "#64748b", marginTop: 1 },
    actRight: { alignItems: "flex-end" },
    actAmount: { fontSize: 14, fontWeight: "700", color: "#27ae60" },
    actDate: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
    signOutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    signOutText: { fontSize: 15, fontWeight: "700", color: "#ef4444" },
});

export default ProfileScreen;
