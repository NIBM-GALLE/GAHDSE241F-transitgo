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
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebase";
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SEAT_COLS = 4;
const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BookTicketScreen = ({ navigation }) => {
    // Steps: 1=Route, 2=Schedule, 3=Seat, 4=Payment, 5=Success (handled via bookingResult)
    const [step, setStep] = useState(1);
    const [routes, setRoutes] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // Seat selection state
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeatsMap, setBookedSeatsMap] = useState({});
    const [loadingSeats, setLoadingSeats] = useState(false);

    // Payment state
    const [paying, setPaying] = useState(false);

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
                s.routeNumber === selectedRoute.routeNumber &&
                s.date >= today &&
                s.status === "Scheduled"
        )
        : [];

    const handleSelectRoute = (route) => {
        setSelectedRoute(route);
        setSelectedSchedule(null);
        setSelectedSeats([]);
        setStep(2);
    };

    const handleSelectSchedule = async (sched) => {
        setSelectedSchedule(sched);
        setSelectedSeats([]);
        setLoadingSeats(true);
        setStep(3);

        // Fetch booked seats from the schedule document
        try {
            const schedDoc = await getDoc(doc(db, "schedules", sched.id));
            if (schedDoc.exists()) {
                const data = schedDoc.data();
                setBookedSeatsMap(data.bookedSeats || {});
            } else {
                setBookedSeatsMap({});
            }
        } catch (err) {
            console.log("Error fetching seats:", err);
            setBookedSeatsMap({});
        } finally {
            setLoadingSeats(false);
        }
    };

    // Build seat grid from bus capacity
    const getBusCapacity = () => {
        if (!selectedSchedule) return 0;
        // Try to find the bus doc capacity; fall back to 32
        const bus = selectedSchedule;
        return bus.capacity || 32;
    };

    const buildSeatGrid = () => {
        const capacity = getBusCapacity();
        const totalRows = Math.ceil(capacity / SEAT_COLS);
        const rows = [];
        let seatIndex = 0;
        for (let r = 0; r < totalRows; r++) {
            const rowLabel = ROW_LABELS[r] || `R${r + 1}`;
            const seats = [];
            for (let c = 1; c <= SEAT_COLS; c++) {
                if (seatIndex < capacity) {
                    const seatId = `${rowLabel}${c}`;
                    seats.push(seatId);
                    seatIndex++;
                }
            }
            rows.push({ label: rowLabel, seats });
        }
        return rows;
    };

    const isSeatBooked = (seatId) => !!bookedSeatsMap[seatId];

    const isSeatSelected = (seatId) => selectedSeats.includes(seatId);

    const toggleSeat = (seatId) => {
        if (isSeatBooked(seatId)) return; // Can't select booked seats
        setSelectedSeats((prev) =>
            prev.includes(seatId)
                ? prev.filter((s) => s !== seatId)
                : [...prev, seatId]
        );
    };

    const getSeatStyle = (seatId) => {
        if (isSeatBooked(seatId)) return styles.seatBooked;
        if (isSeatSelected(seatId)) return styles.seatChosen;
        return styles.seatAvailable;
    };

    const getSeatTextStyle = (seatId) => {
        if (isSeatBooked(seatId)) return styles.seatTextBooked;
        if (isSeatSelected(seatId)) return styles.seatTextChosen;
        return styles.seatTextAvailable;
    };

    // Dummy Payment
    const handlePayment = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Please sign in to book a ticket.");
            return;
        }

        setPaying(true);

        // Simulate payment processing (2-second delay)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const fare = selectedRoute.fare || 0;
            const totalFare = fare * selectedSeats.length;

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
                fare: fare,
                totalFare: totalFare,
                seatCount: selectedSeats.length,
                seats: selectedSeats,
                status: "Confirmed",
                paymentStatus: "Paid",
                paymentMethod: "Dummy Payment",
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "bookings"), bookingData);

            // Update booked seats on the schedule document
            const updatedBookedSeats = { ...bookedSeatsMap };
            selectedSeats.forEach((seatId) => {
                updatedBookedSeats[seatId] = user.uid;
            });

            await updateDoc(doc(db, "schedules", selectedSchedule.id), {
                bookedSeats: updatedBookedSeats,
            });

            setBookingResult({
                ...bookingData,
                date: selectedSchedule.date,
                time: selectedSchedule.time,
            });
        } catch (err) {
            console.log("Booking error:", err);
            Alert.alert("Error", "Failed to book ticket. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const resetBooking = () => {
        setStep(1);
        setSelectedRoute(null);
        setSelectedSchedule(null);
        setSelectedSeats([]);
        setBookedSeatsMap({});
        setBookingResult(null);
    };

    // ─── BOOKING SUCCESS SCREEN ───
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
                        <Text style={styles.successSub}>Your ticket has been booked & paid successfully</Text>

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
                                <Text style={styles.ticketValue}>{bookingResult.seats.join(", ")}</Text>
                            </View>
                            <View style={styles.ticketRow}>
                                <Text style={styles.ticketLabel}>Payment</Text>
                                <Text style={[styles.ticketValue, { color: "#16c98d" }]}>✓ Paid</Text>
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

    // ─── MAIN BOOKING FLOW ───
    const stepLabels = ["Route", "Schedule", "Seats", "Payment"];
    const totalSteps = 4;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.header}>
                <Text style={styles.headerTitle}>🎫 Book a Ticket</Text>
                <View style={styles.stepIndicator}>
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                        <View key={s} style={styles.stepRow}>
                            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
                                <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
                            </View>
                            {s < totalSteps && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
                        </View>
                    ))}
                </View>
                <View style={styles.stepLabels}>
                    {stepLabels.map((label, i) => (
                        <Text key={i} style={[styles.stepLabel, step >= i + 1 && styles.stepLabelActive]}>
                            {label}
                        </Text>
                    ))}
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#27ae60" />
                    <Text style={styles.loadingText}>Loading routes...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    {/* ─── Step 1: Select Route ─── */}
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

                    {/* ─── Step 2: Select Schedule ─── */}
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

                    {/* ─── Step 3: Seat Selection ─── */}
                    {step === 3 && (
                        <>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                                <Ionicons name="arrow-back" size={18} color="#3b82f6" />
                                <Text style={styles.backText}>Change Schedule</Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Choose your seat</Text>

                            {loadingSeats ? (
                                <View style={styles.centerBox}>
                                    <ActivityIndicator size="large" color="#27ae60" />
                                    <Text style={styles.loadingText}>Loading seats...</Text>
                                </View>
                            ) : (
                                <View style={styles.seatContainer}>
                                    {/* Steering wheel icon */}
                                    <View style={styles.steeringRow}>
                                        <Ionicons name="bus" size={24} color="#94a3b8" />
                                        <Text style={styles.steeringText}>Front</Text>
                                    </View>

                                    {/* Column headers */}
                                    <View style={styles.seatGridRow}>
                                        <View style={styles.rowLabelSpace} />
                                        <View style={styles.seatCell}>
                                            <Text style={styles.colHeader}>1</Text>
                                        </View>
                                        <View style={styles.seatCell}>
                                            <Text style={styles.colHeader}>2</Text>
                                        </View>
                                        <View style={styles.aisleGap} />
                                        <View style={styles.seatCell}>
                                            <Text style={styles.colHeader}>3</Text>
                                        </View>
                                        <View style={styles.seatCell}>
                                            <Text style={styles.colHeader}>4</Text>
                                        </View>
                                    </View>

                                    {/* Seat rows */}
                                    {buildSeatGrid().map((row) => (
                                        <View key={row.label} style={styles.seatGridRow}>
                                            <View style={styles.rowLabelSpace}>
                                                <Text style={styles.rowLabel}>{row.label}</Text>
                                            </View>
                                            {row.seats.map((seatId, colIdx) => (
                                                <React.Fragment key={seatId}>
                                                    {colIdx === 2 && <View style={styles.aisleGap} />}
                                                    <TouchableOpacity
                                                        style={[styles.seatCell]}
                                                        onPress={() => toggleSeat(seatId)}
                                                        activeOpacity={isSeatBooked(seatId) ? 1 : 0.6}
                                                    >
                                                        <View style={[styles.seatBox, getSeatStyle(seatId)]}>
                                                            <Text style={getSeatTextStyle(seatId)}>
                                                                {isSeatBooked(seatId) ? "✕" : ""}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </React.Fragment>
                                            ))}
                                            {/* Fill empty seats if row has less than 4 */}
                                            {row.seats.length < SEAT_COLS &&
                                                Array.from({ length: SEAT_COLS - row.seats.length }).map((_, idx) => (
                                                    <View key={`empty-${idx}`} style={styles.seatCell} />
                                                ))}
                                        </View>
                                    ))}

                                    {/* Legend */}
                                    <View style={styles.legend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.seatAvailable]} />
                                            <Text style={styles.legendText}>Available</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.seatBooked]} />
                                            <Text style={styles.legendText}>Booked</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.seatChosen]} />
                                            <Text style={styles.legendText}>Chosen</Text>
                                        </View>
                                    </View>

                                    {/* Selected seats info */}
                                    {selectedSeats.length > 0 && (
                                        <View style={styles.selectedSeatsInfo}>
                                            <Text style={styles.selectedSeatsLabel}>
                                                Selected: {selectedSeats.sort().join(", ")}
                                            </Text>
                                            <Text style={styles.selectedSeatsFare}>
                                                Rs. {(selectedRoute.fare || 0) * selectedSeats.length}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Next button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.nextBtn,
                                            selectedSeats.length === 0 && styles.nextBtnDisabled,
                                        ]}
                                        onPress={() => {
                                            if (selectedSeats.length > 0) setStep(4);
                                        }}
                                        disabled={selectedSeats.length === 0}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={
                                                selectedSeats.length > 0
                                                    ? ["#0288D1", "#03A9F4"]
                                                    : ["#ccc", "#ccc"]
                                            }
                                            style={styles.nextBtnGrad}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={styles.nextBtnText}>Next</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* ─── Step 4: Dummy Payment ─── */}
                    {step === 4 && (
                        <>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
                                <Ionicons name="arrow-back" size={18} color="#3b82f6" />
                                <Text style={styles.backText}>Change Seats</Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Payment</Text>

                            <View style={styles.paymentCard}>
                                {/* Payment summary */}
                                <View style={styles.paymentIcon}>
                                    <Ionicons name="card" size={40} color="#0288D1" />
                                </View>
                                <Text style={styles.paymentTitle}>Payment</Text>
                                <Text style={styles.paymentSub}>
                                    This is a simulated payment for demonstration purposes
                                </Text>

                                <View style={styles.paymentDivider} />

                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Route</Text>
                                    <Text style={styles.paymentValue}>
                                        {selectedRoute.routeNumber} — {selectedRoute.start} → {selectedRoute.destination}
                                    </Text>
                                </View>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Bus</Text>
                                    <Text style={styles.paymentValue}>
                                        {selectedSchedule.busNumber || "N/A"}
                                    </Text>
                                </View>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Date & Time</Text>
                                    <Text style={styles.paymentValue}>
                                        {selectedSchedule.date} at {selectedSchedule.time}
                                    </Text>
                                </View>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Seats</Text>
                                    <Text style={styles.paymentValue}>
                                        {selectedSeats.sort().join(", ")}
                                    </Text>
                                </View>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Fare per seat</Text>
                                    <Text style={styles.paymentValue}>
                                        Rs. {selectedRoute.fare || 0}
                                    </Text>
                                </View>

                                <View style={styles.paymentDivider} />

                                <View style={styles.paymentTotalRow}>
                                    <Text style={styles.paymentTotalLabel}>Total Amount</Text>
                                    <Text style={styles.paymentTotalValue}>
                                        Rs. {(selectedRoute.fare || 0) * selectedSeats.length}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.payBtn}
                                onPress={handlePayment}
                                disabled={paying}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#27ae60", "#16c98d"]}
                                    style={styles.payBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {paying ? (
                                        <>
                                            <ActivityIndicator color="#fff" size="small" />
                                            <Text style={styles.payBtnText}>Processing Payment...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="wallet" size={22} color="#fff" />
                                            <Text style={styles.payBtnText}>Pay Now</Text>
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
    stepLine: { width: 36, height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 4 },
    stepLineActive: { backgroundColor: "#27ae60" },
    stepLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
    stepLabel: { fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: "600" },
    stepLabelActive: { color: "rgba(255,255,255,0.8)" },
    centerBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingVertical: 40 },
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

    // ─── Seat Selection ───
    seatContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    steeringRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    steeringText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
    seatGridRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    rowLabelSpace: {
        width: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
    colHeader: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textAlign: "center" },
    seatCell: {
        width: (SCREEN_WIDTH - 120) / 4,
        height: (SCREEN_WIDTH - 120) / 4,
        maxWidth: 60,
        maxHeight: 60,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 3,
    },
    aisleGap: { width: 20 },
    seatBox: {
        width: "88%",
        height: "88%",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    seatAvailable: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#d1d5db",
    },
    seatBooked: {
        backgroundColor: "#B3E5FC",
        borderWidth: 2,
        borderColor: "#81D4FA",
    },
    seatChosen: {
        backgroundColor: "#0288D1",
        borderWidth: 2,
        borderColor: "#0277BD",
    },
    seatTextAvailable: { fontSize: 10, color: "#94a3b8" },
    seatTextBooked: { fontSize: 12, color: "#fff", fontWeight: "700" },
    seatTextChosen: { fontSize: 10, color: "#fff", fontWeight: "700" },

    // Legend
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendBox: { width: 22, height: 22, borderRadius: 5 },
    legendText: { fontSize: 12, color: "#64748b", fontWeight: "600" },

    // Selected seats info
    selectedSeatsInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14,
        paddingHorizontal: 4,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    selectedSeatsLabel: { fontSize: 13, fontWeight: "600", color: "#1e293b", flex: 1 },
    selectedSeatsFare: { fontSize: 16, fontWeight: "800", color: "#27ae60" },

    // Next button
    nextBtn: { borderRadius: 14, overflow: "hidden", marginTop: 16 },
    nextBtnDisabled: { opacity: 0.5 },
    nextBtnGrad: {
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // ─── Payment ───
    paymentCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        marginBottom: 20,
        alignItems: "center",
    },
    paymentIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#E1F5FE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    paymentTitle: { fontSize: 20, fontWeight: "800", color: "#1e293b", marginBottom: 4 },
    paymentSub: { fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 4 },
    paymentDivider: { width: "100%", height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
    paymentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        marginBottom: 10,
    },
    paymentLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "600", flex: 0.4 },
    paymentValue: { fontSize: 13, fontWeight: "600", color: "#1e293b", flex: 0.6, textAlign: "right" },
    paymentTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    paymentTotalLabel: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
    paymentTotalValue: { fontSize: 24, fontWeight: "800", color: "#27ae60" },
    payBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
    payBtnGrad: {
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    payBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // ─── Success ───
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
