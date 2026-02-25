import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebase";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

const BookTicketScreen = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1: select route, 2: select schedule, 3: confirm
    const [routes, setRoutes] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [seatCount, setSeatCount] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [routeSnap, schedSnap] = await Promise.all([
                getDocs(collection(db, "routes")),
                getDocs(collection(db, "schedules")),
            ]);
            setRoutes(routeSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setSchedules(schedSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.log("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    const availableSchedules = selectedRoute
        ? schedules.filter(
            (s) =>
                (s.routeNumber === selectedRoute.routeNumber) &&
                s.date >= today &&
                s.status === "Scheduled"
        )
        : [];

    const handleSelectRoute = (route) => {
        setSelectedRoute(route);
        setSelectedSchedule(null);
        setStep(2);
    };

    const handleSelectSchedule = (sched) => {
        setSelectedSchedule(sched);
        setStep(3);
    };

    const handleConfirmBooking = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Please sign in to book a ticket.");
            return;
        }

        setBooking(true);
        try {
            const bookingData = {
                userId: user.uid,
                userName: user.displayName || user.email,
                scheduleId: selectedSchedule.id,
                busId: selectedSchedule.busId || null,
                busNumber: selectedSchedule.busNumber || "N/A",
                routeNumber: selectedRoute.routeNumber,
                start: selectedRoute.start,
                destination: selectedRoute.destination,
                via: selectedRoute.via || "",
                date: selectedSchedule.date,
                time: selectedSchedule.time,
                fare: selectedRoute.fare || 0,
                totalFare: (selectedRoute.fare || 0) * seatCount,
                seatCount: seatCount,
                status: "Confirmed",
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "bookings"), bookingData);

            setBookingResult({
                ...bookingData,
                date: selectedSchedule.date,
                time: selectedSchedule.time,
            });
        } catch (err) {
            console.log("Booking error:", err);
            Alert.alert("Error", "Failed to book ticket. Please try again.");
        } finally {
            setBooking(false);
        }
    };

    const resetBooking = () => {
        setStep(1);
        setSelectedRoute(null);
        setSelectedSchedule(null);
        setBookingResult(null);
        setSeatCount(1);
    };

    // Booking success
    if (bookingResult) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.successContainer}>
                        <View style={styles.successIconWrap}>
                            <Ionicons name="checkmark-circle" size={72} color="#27ae60" />
                        </View>
                        <Text style={styles.successTitle}>Booking Confirmed!</Text>
                        <Text style={styles.successSub}>Your ticket has been booked successfully</Text>

                        <View style={styles.ticketCard}>
                            <View style={styles.ticketHeader}>
                                <Ionicons name="ticket" size={22} color="#27ae60" />
                                <Text style={styles.ticketHeaderText}>Ticket Details</Text>
                            </View>

                            <View style={styles.ticketDivider} />

                            <View style={styles.ticketRouteSection}>
                                <View style={styles.ticketPoint}>
                                    <View style={[styles.ticketDot, { backgroundColor: "#27ae60" }]} />
                                    <View>
                                        <Text style={styles.ticketPointLabel}>From</Text>
                                        <Text style={styles.ticketPointValue}>{bookingResult.start}</Text>
                                    </View>
                                </View>
                                <View style={styles.ticketLine} />
                                <View style={styles.ticketPoint}>
                                    <View style={[styles.ticketDot, { backgroundColor: "#3b82f6" }]} />
                                    <View>
                                        <Text style={styles.ticketPointLabel}>To</Text>
                                        <Text style={styles.ticketPointValue}>{bookingResult.destination}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.ticketDivider} />

                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Bus</Text>
                                <Text style={styles.ticketValue}>{bookingResult.busNumber}</Text>
                            </View>
                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Route</Text>
                                <Text style={styles.ticketValue}>{bookingResult.routeNumber}</Text>
                            </View>
                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Date</Text>
                                <Text style={styles.ticketValue}>{bookingResult.date}</Text>
                            </View>
                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Time</Text>
                                <Text style={styles.ticketValue}>{bookingResult.time}</Text>
                            </View>
                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Seats</Text>
                                <Text style={styles.ticketValue}>{bookingResult.seatCount}</Text>
                            </View>

                            <View style={styles.ticketDivider} />

                            <View style={styles.ticketRow}>
                                <Text style={[styles.ticketLabel, { fontWeight: "700", fontSize: 16 }]}>Total</Text>
                                <Text style={styles.ticketTotal}>Rs. {bookingResult.totalFare}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.newBookingBtn} onPress={resetBooking}>
                            <LinearGradient
                                colors={["#27ae60", "#16c98d"]}
                                style={styles.newBookingGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text style={styles.newBookingText}>Book Another</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={{ marginTop: 12 }}>
                            <Text style={styles.goHomeText}>Go to Home</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.header}>
                <Text style={styles.headerTitle}>🎫 Book a Ticket</Text>
                <View style={styles.stepIndicator}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={styles.stepRow}>
                            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
                                <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
                            </View>
                            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
                        </View>
                    ))}
                </View>
                <View style={styles.stepLabels}>
                    <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Route</Text>
                    <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Schedule</Text>
                    <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Confirm</Text>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#27ae60" />
                    <Text style={styles.loadingText}>Loading routes...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    {/* Step 1: Select Route */}
                    {step === 1 && (
                        <>
                            <Text style={styles.sectionTitle}>Select a Route</Text>
                            {routes.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <Ionicons name="map-outline" size={40} color="#d1d5db" />
                                    <Text style={styles.emptyText}>No routes available</Text>
                                </View>
                            ) : (
                                routes.map((route) => (
                                    <TouchableOpacity
                                        key={route.id}
                                        style={styles.routeCard}
                                        onPress={() => handleSelectRoute(route)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.routeCardLeft}>
                                            <View style={styles.routeIcon}>
                                                <Ionicons name="navigate" size={20} color="#27ae60" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.routeNum}>Route {route.routeNumber}</Text>
                                                <Text style={styles.routePoints}>
                                                    {route.start} → {route.destination}
                                                </Text>
                                                {route.via ? (
                                                    <Text style={styles.routeVia}>Via: {route.via}</Text>
                                                ) : null}
                                            </View>
                                        </View>
                                        <View style={styles.routeCardRight}>
                                            <Text style={styles.routeFare}>Rs. {route.fare || 0}</Text>
                                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </>
                    )}

                    {/* Step 2: Select Schedule */}
                    {step === 2 && (
                        <>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                                <Ionicons name="arrow-back" size={18} color="#3b82f6" />
                                <Text style={styles.backText}>Change Route</Text>
                            </TouchableOpacity>

                            <View style={styles.selectedInfo}>
                                <Text style={styles.selectedLabel}>Selected Route</Text>
                                <Text style={styles.selectedValue}>
                                    {selectedRoute.routeNumber} — {selectedRoute.start} → {selectedRoute.destination}
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>Select a Schedule</Text>
                            {availableSchedules.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
                                    <Text style={styles.emptyText}>No upcoming schedules for this route</Text>
                                </View>
                            ) : (
                                availableSchedules.map((sched) => (
                                    <TouchableOpacity
                                        key={sched.id}
                                        style={styles.schedCard}
                                        onPress={() => handleSelectSchedule(sched)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.schedBus}>🚌 {sched.busNumber || "Bus"}</Text>
                                            <Text style={styles.schedDriver}>{sched.driverName || "Unknown"}</Text>
                                        </View>
                                        <View style={styles.schedRight}>
                                            <Text style={styles.schedDate}>{sched.date}</Text>
                                            <Text style={styles.schedTime}>{sched.time}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </>
                    )}

                    {/* Step 3: Confirm Booking */}
                    {step === 3 && (
                        <>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                                <Ionicons name="arrow-back" size={18} color="#3b82f6" />
                                <Text style={styles.backText}>Change Schedule</Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Confirm Your Booking</Text>

                            <View style={styles.confirmCard}>
                                <View style={styles.confirmRow}>
                                    <Ionicons name="navigate" size={18} color="#3b82f6" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.confirmLabel}>Route {selectedRoute.routeNumber}</Text>
                                        <Text style={styles.confirmValue}>
                                            {selectedRoute.start} → {selectedRoute.destination}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.confirmDivider} />

                                <View style={styles.confirmRow}>
                                    <Ionicons name="bus" size={18} color="#27ae60" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.confirmLabel}>Bus {selectedSchedule.busNumber}</Text>
                                        <Text style={styles.confirmValue}>Driver: {selectedSchedule.driverName || "N/A"}</Text>
                                    </View>
                                </View>

                                <View style={styles.confirmDivider} />

                                <View style={styles.confirmRow}>
                                    <Ionicons name="calendar" size={18} color="#f59e0b" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.confirmLabel}>{selectedSchedule.date}</Text>
                                        <Text style={styles.confirmValue}>{selectedSchedule.time}</Text>
                                    </View>
                                </View>

                                <View style={styles.confirmDivider} />

                                {/* Seat selector */}
                                <View style={styles.seatRow}>
                                    <Text style={styles.seatLabel}>Seats</Text>
                                    <View style={styles.seatCounter}>
                                        <TouchableOpacity
                                            style={styles.seatBtn}
                                            onPress={() => setSeatCount(Math.max(1, seatCount - 1))}
                                        >
                                            <Ionicons name="remove" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.seatNum}>{seatCount}</Text>
                                        <TouchableOpacity
                                            style={styles.seatBtn}
                                            onPress={() => setSeatCount(Math.min(10, seatCount + 1))}
                                        >
                                            <Ionicons name="add" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.confirmDivider} />

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total Fare</Text>
                                    <Text style={styles.totalValue}>
                                        Rs. {(selectedRoute.fare || 0) * seatCount}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleConfirmBooking}
                                disabled={booking}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#27ae60", "#16c98d"]}
                                    style={styles.confirmBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {booking ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f1f5f9" },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24 },
    headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 16 },
    stepIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    stepRow: { flexDirection: "row", alignItems: "center" },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.2)",
    },
    stepCircleActive: { backgroundColor: "#27ae60", borderColor: "#27ae60" },
    stepNum: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
    stepNumActive: { color: "#fff" },
    stepLine: { width: 50, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 4 },
    stepLineActive: { backgroundColor: "#27ae60" },
    stepLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
    stepLabel: { fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: "600" },
    stepLabelActive: { color: "rgba(255,255,255,0.8)" },
    centerBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    loadingText: { fontSize: 14, color: "#64748b" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 14 },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 36,
        alignItems: "center",
        gap: 8,
    },
    emptyText: { fontSize: 14, color: "#94a3b8" },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
    backText: { fontSize: 14, color: "#3b82f6", fontWeight: "600" },
    selectedInfo: {
        backgroundColor: "#eff6ff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#3b82f6",
    },
    selectedLabel: { fontSize: 11, fontWeight: "700", color: "#3b82f6", textTransform: "uppercase" },
    selectedValue: { fontSize: 14, fontWeight: "600", color: "#1e293b", marginTop: 4 },

    // Route cards
    routeCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    routeCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    routeIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#ecfdf5",
        justifyContent: "center",
        alignItems: "center",
    },
    routeNum: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    routePoints: { fontSize: 13, color: "#64748b", marginTop: 2 },
    routeVia: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
    routeCardRight: { alignItems: "flex-end", flexDirection: "row", gap: 6, alignItems: "center" },
    routeFare: { fontSize: 15, fontWeight: "700", color: "#27ae60" },

    // Schedule cards
    schedCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        elevation: 1,
    },
    schedBus: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    schedDriver: { fontSize: 12, color: "#64748b", marginTop: 2 },
    schedRight: { alignItems: "flex-end" },
    schedDate: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
    schedTime: { fontSize: 12, color: "#27ae60", fontWeight: "600", marginTop: 2 },

    // Confirm
    confirmCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    confirmRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 4 },
    confirmLabel: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
    confirmValue: { fontSize: 13, color: "#64748b", marginTop: 2 },
    confirmDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
    seatRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    seatLabel: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
    seatCounter: { flexDirection: "row", alignItems: "center", gap: 12 },
    seatBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#27ae60",
        justifyContent: "center",
        alignItems: "center",
    },
    seatNum: { fontSize: 18, fontWeight: "800", color: "#1e293b", minWidth: 24, textAlign: "center" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
    totalValue: { fontSize: 22, fontWeight: "800", color: "#27ae60" },
    confirmBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
    confirmBtnGrad: {
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // Success
    successContainer: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    successIconWrap: { marginBottom: 16 },
    successTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 4 },
    successSub: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 },
    ticketCard: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    ticketHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    ticketHeaderText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    ticketDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 14 },
    ticketRouteSection: { paddingVertical: 4 },
    ticketPoint: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
    ticketDot: { width: 12, height: 12, borderRadius: 6 },
    ticketPointLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" },
    ticketPointValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
    ticketLine: {
        width: 2,
        height: 16,
        backgroundColor: "rgba(255,255,255,0.15)",
        marginLeft: 5,
        marginVertical: 2,
    },
    ticketRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    ticketLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
    ticketValue: { fontSize: 14, fontWeight: "600", color: "#fff" },
    ticketTotal: { fontSize: 22, fontWeight: "800", color: "#16c98d" },
    newBookingBtn: { borderRadius: 14, overflow: "hidden", width: "100%", marginTop: 24 },
    newBookingGrad: {
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    newBookingText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    goHomeText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
});

export default BookTicketScreen;
