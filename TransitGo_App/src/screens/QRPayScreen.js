import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebase";
import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
} from "firebase/firestore";

const QRPayScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const snap = await getDocs(collection(db, "routes"));
            setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (_) { }
    };

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned || processing) return;
        setScanned(true);
        setProcessing(true);

        try {
            // Expected format: transitgo://bus/{busId}
            const match = data.match(/transitgo:\/\/bus\/(.+)/);
            if (!match) {
                Alert.alert("Invalid QR", "This QR code is not a valid TransitGo bus code.");
                setProcessing(false);
                return;
            }

            const busId = match[1];
            const busDoc = await getDoc(doc(db, "buses", busId));

            if (!busDoc.exists()) {
                Alert.alert("Bus Not Found", "This bus is not registered in the system.");
                setProcessing(false);
                return;
            }

            const busData = busDoc.data();
            const routeInfo = routes.find(
                (r) => r.routeNumber === busData.routeNumber || r.routeNumber === busData.route
            );
            const fare = routeInfo?.fare || 0;

            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Error", "Please sign in to make a payment.");
                setProcessing(false);
                return;
            }

            // Create payment record
            const paymentData = {
                userId: user.uid,
                userName: user.displayName || user.email,
                busId: busId,
                busNumber: busData.busNumber || "N/A",
                routeNumber: busData.routeNumber || busData.route || "N/A",
                destination: routeInfo?.destination || "N/A",
                start: routeInfo?.start || "N/A",
                amount: fare,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString(),
                status: "Completed",
                paymentMethod: "QR Scan",
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "payments"), paymentData);

            setPaymentResult({
                busNumber: busData.busNumber,
                driverName: busData.driverName,
                routeNumber: busData.routeNumber || busData.route,
                destination: routeInfo?.destination || "N/A",
                start: routeInfo?.start || "N/A",
                fare: fare,
                date: paymentData.date,
                time: paymentData.time,
            });
        } catch (err) {
            console.log("Payment error:", err);
            Alert.alert("Error", "Failed to process payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const resetScanner = () => {
        setScanned(false);
        setPaymentResult(null);
    };

    // Permission not determined yet
    if (!permission) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#27ae60" />
                </View>
            </View>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.permScreen}>
                    <View style={styles.permContent}>
                        <View style={styles.permIcon}>
                            <Ionicons name="camera-outline" size={56} color="#16c98d" />
                        </View>
                        <Text style={styles.permTitle}>Camera Access Needed</Text>
                        <Text style={styles.permDesc}>
                            To scan QR codes on buses, TransitGo needs access to your camera.
                        </Text>
                        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
                            <LinearGradient
                                colors={["#27ae60", "#16c98d"]}
                                style={styles.permBtnGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.permBtnText}>Grant Permission</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    // Payment success screen
    if (paymentResult) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.resultContainer}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={72} color="#27ae60" />
                        </View>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successSub}>Your daily bus fare has been recorded</Text>

                        <View style={styles.receiptCard}>
                            <View style={styles.receiptHeader}>
                                <Ionicons name="receipt" size={20} color="#27ae60" />
                                <Text style={styles.receiptTitle}>Payment Receipt</Text>
                            </View>

                            <View style={styles.receiptDivider} />

                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Bus Number</Text>
                                <Text style={styles.receiptValue}>{paymentResult.busNumber}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Driver</Text>
                                <Text style={styles.receiptValue}>{paymentResult.driverName || "N/A"}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Route</Text>
                                <Text style={styles.receiptValue}>{paymentResult.routeNumber}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>From</Text>
                                <Text style={styles.receiptValue}>{paymentResult.start}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>To</Text>
                                <Text style={styles.receiptValue}>{paymentResult.destination}</Text>
                            </View>

                            <View style={styles.receiptDivider} />

                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Date</Text>
                                <Text style={styles.receiptValue}>{paymentResult.date}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Time</Text>
                                <Text style={styles.receiptValue}>{paymentResult.time}</Text>
                            </View>

                            <View style={styles.receiptDivider} />

                            <View style={styles.receiptRow}>
                                <Text style={[styles.receiptLabel, { fontWeight: "700", fontSize: 16 }]}>
                                    Amount
                                </Text>
                                <Text style={styles.fareAmount}>Rs. {paymentResult.fare}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.scanAgainBtn} onPress={resetScanner}>
                            <LinearGradient
                                colors={["#27ae60", "#16c98d"]}
                                style={styles.scanAgainGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="qr-code" size={20} color="#fff" />
                                <Text style={styles.scanAgainText}>Scan Another</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.goHomeBtn}
                            onPress={() => navigation.navigate("Home")}
                        >
                            <Text style={styles.goHomeText}>Go to Home</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </LinearGradient>
            </View>
        );
    }

    // Scanner screen
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                {/* Overlay */}
                <LinearGradient
                    colors={["rgba(15,32,39,0.85)", "transparent", "transparent", "rgba(15,32,39,0.85)"]}
                    style={styles.overlay}
                >
                    <View style={styles.scanHeader}>
                        <Text style={styles.scanTitle}>Scan QR Code</Text>
                        <Text style={styles.scanSub}>
                            Point your camera at the QR code on the bus
                        </Text>
                    </View>

                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    {processing && (
                        <View style={styles.processingBox}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.processingText}>Processing payment...</Text>
                        </View>
                    )}

                    {scanned && !processing && !paymentResult && (
                        <TouchableOpacity style={styles.rescanBtn} onPress={resetScanner}>
                            <Ionicons name="refresh" size={18} color="#fff" />
                            <Text style={styles.rescanText}>Tap to rescan</Text>
                        </TouchableOpacity>
                    )}
                </LinearGradient>
            </CameraView>
        </View>
    );
};

const SCAN_SIZE = 250;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f2027" },
    centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

    // Permission screen
    permScreen: { flex: 1 },
    permContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
    permIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(22,201,141,0.12)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 2,
        borderColor: "rgba(22,201,141,0.3)",
    },
    permTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8 },
    permDesc: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 32, lineHeight: 20 },
    permButton: { borderRadius: 14, overflow: "hidden", width: "100%" },
    permBtnGrad: {
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    permBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // Camera
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 60 },
    scanHeader: { alignItems: "center", marginTop: 20 },
    scanTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
    scanSub: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
    scanFrame: { width: SCAN_SIZE, height: SCAN_SIZE, position: "relative" },
    corner: { position: "absolute", width: 30, height: 30, borderColor: "#16c98d", borderWidth: 3 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
    processingBox: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
    processingText: { color: "#fff", fontSize: 14 },
    rescanBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    rescanText: { color: "#fff", fontSize: 14, fontWeight: "600" },

    // Result
    resultContainer: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    successIcon: { marginBottom: 16 },
    successTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 4 },
    successSub: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 },
    receiptCard: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    receiptHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    receiptTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
    receiptDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 14,
    },
    receiptRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    receiptLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
    receiptValue: { fontSize: 14, fontWeight: "600", color: "#fff" },
    fareAmount: { fontSize: 20, fontWeight: "800", color: "#16c98d" },
    scanAgainBtn: { borderRadius: 14, overflow: "hidden", width: "100%", marginTop: 24 },
    scanAgainGrad: {
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
    },
    scanAgainText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    goHomeBtn: { marginTop: 14 },
    goHomeText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
});

export default QRPayScreen;
