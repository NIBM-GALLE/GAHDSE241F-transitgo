import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const SchedulesScreen = () => {
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState("all"); // "today", "upcoming", "all"

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [schedSnap, routeSnap, busSnap] = await Promise.all([
                getDocs(collection(db, "schedules")),
                getDocs(collection(db, "routes")),
                getDocs(collection(db, "buses")),
            ]);

            const schedList = schedSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => {
                    const dateCompare = (a.date || "").localeCompare(b.date || "");
                    if (dateCompare !== 0) return dateCompare;
                    return (a.time || "").localeCompare(b.time || "");
                });

            setSchedules(schedList);
            setRoutes(routeSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setBuses(busSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.log("Error fetching schedules:", err);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const today = new Date().toISOString().split("T")[0];

    const filteredSchedules = schedules.filter((sched) => {
        // Date filter
        if (filterDate === "today" && sched.date !== today) return false;
        if (filterDate === "upcoming" && sched.date < today) return false;

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchBus = (sched.busNumber || "").toLowerCase().includes(q);
            const matchRoute = (sched.routeNumber || "").toLowerCase().includes(q);
            const matchDest = (sched.destination || "").toLowerCase().includes(q);
            const matchDriver = (sched.driverName || "").toLowerCase().includes(q);
            if (!matchBus && !matchRoute && !matchDest && !matchDriver) return false;
        }

        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "Scheduled": return "#27ae60";
            case "Completed": return "#3b82f6";
            case "Cancelled": return "#ef4444";
            default: return "#64748b";
        }
    };

    const getRouteInfo = (routeNumber) => {
        return routes.find((r) => r.routeNumber === routeNumber);
    };

    const filters = [
        { key: "all", label: "All" },
        { key: "today", label: "Today" },
        { key: "upcoming", label: "Upcoming" },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={["#0f2027", "#203a43", "#2c5364"]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>📅 Bus Schedules</Text>
                <Text style={styles.headerSub}>
                    {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? "s" : ""} found
                </Text>
            </LinearGradient>

            <View style={styles.searchSection}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by bus, route, destination..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterChip,
                                filterDate === f.key && styles.filterChipActive,
                            ]}
                            onPress={() => setFilterDate(f.key)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filterDate === f.key && styles.filterTextActive,
                                ]}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#27ae60" />
                    <Text style={styles.loadingText}>Loading schedules...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#27ae60"]} />
                    }
                >
                    {filteredSchedules.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>No schedules found</Text>
                            <Text style={styles.emptyDesc}>
                                {searchQuery ? "Try a different search term" : "No bus schedules available yet"}
                            </Text>
                        </View>
                    ) : (
                        filteredSchedules.map((sched, idx) => {
                            const routeInfo = getRouteInfo(sched.routeNumber);
                            return (
                                <View key={sched.id} style={styles.schedCard}>
                                    <View style={styles.schedHeader}>
                                        <View style={styles.busInfo}>
                                            <View style={styles.busIcon}>
                                                <Ionicons name="bus" size={20} color="#27ae60" />
                                            </View>
                                            <View>
                                                <Text style={styles.busNumber}>{sched.busNumber || "N/A"}</Text>
                                                <Text style={styles.driverName}>
                                                    {sched.driverName || "Unknown driver"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusColor(sched.status) + "18" },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(sched.status) },
                                                ]}
                                            >
                                                {sched.status || "Scheduled"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.routeRow}>
                                        <View style={styles.routeTag}>
                                            <Ionicons name="navigate" size={14} color="#3b82f6" />
                                            <Text style={styles.routeText}>
                                                Route {sched.routeNumber || "-"}
                                            </Text>
                                        </View>
                                        {routeInfo && (
                                            <Text style={styles.routeDetail}>
                                                {routeInfo.start} → {routeInfo.destination}
                                            </Text>
                                        )}
                                        {!routeInfo && sched.destination && (
                                            <Text style={styles.routeDetail}>→ {sched.destination}</Text>
                                        )}
                                    </View>

                                    <View style={styles.schedFooter}>
                                        <View style={styles.dateTimeRow}>
                                            <View style={styles.dtItem}>
                                                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                                <Text style={styles.dtText}>{sched.date || "N/A"}</Text>
                                            </View>
                                            <View style={styles.dtItem}>
                                                <Ionicons name="time-outline" size={16} color="#64748b" />
                                                <Text style={styles.dtText}>{sched.time || "N/A"}</Text>
                                            </View>
                                        </View>
                                        {routeInfo && routeInfo.fare > 0 && (
                                            <View style={styles.fareTag}>
                                                <Text style={styles.fareText}>Rs. {routeInfo.fare}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f5f9" },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24 },
    headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
    headerSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },
    searchSection: { paddingHorizontal: 20, paddingTop: 16 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        gap: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    searchInput: { flex: 1, fontSize: 14, color: "#1e293b" },
    filterRow: { marginTop: 12, marginBottom: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#fff",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    filterChipActive: {
        backgroundColor: "#27ae60",
        borderColor: "#27ae60",
    },
    filterText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    filterTextActive: { color: "#fff" },
    centerBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    loadingText: { fontSize: 14, color: "#64748b" },
    list: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        gap: 8,
        marginTop: 20,
    },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#64748b" },
    emptyDesc: { fontSize: 13, color: "#94a3b8" },
    schedCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    schedHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    busInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    busIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#ecfdf5",
        justifyContent: "center",
        alignItems: "center",
    },
    busNumber: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    driverName: { fontSize: 12, color: "#64748b", marginTop: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: "700" },
    routeRow: { marginBottom: 12, gap: 4 },
    routeTag: { flexDirection: "row", alignItems: "center", gap: 4 },
    routeText: { fontSize: 13, fontWeight: "600", color: "#3b82f6" },
    routeDetail: { fontSize: 13, color: "#64748b", marginLeft: 18 },
    schedFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 12,
    },
    dateTimeRow: { flexDirection: "row", gap: 16 },
    dtItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    dtText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
    fareTag: {
        backgroundColor: "#ecfdf5",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    fareText: { fontSize: 13, fontWeight: "700", color: "#27ae60" },
});

export default SchedulesScreen;
