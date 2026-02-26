import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmail } from "../../firebase/auth";

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        setLoading(true);
        const result = await signInWithEmail(email.trim(), password);
        setLoading(false);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#0f2027", "#203a43", "#2c5364"]}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo Area */}
                        <View style={styles.logoArea}>
                            <Image
                                source={require("../../../assets/logo.png")}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.tagline}>Your Smart Transit Companion</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.card}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subText}>Sign in to continue</Text>

                            {error ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={18} color="#ef4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.inputGroup}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color="#94a3b8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#94a3b8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#94a3b8"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.signInButton}
                                onPress={handleSignIn}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#27ae60", "#16c98d"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.signInButtonText}>Sign In</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.signUpLink}
                                onPress={() => navigation.navigate("SignUp")}
                            >
                                <Text style={styles.signUpLinkText}>
                                    Don't have an account?{" "}
                                    <Text style={styles.signUpHighlight}>Sign Up</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logoArea: { alignItems: "center", marginBottom: 36 },
    logoImage: {
        width: 160,
        height: 160,
        marginBottom: 8,
    },
    appName: {
        fontSize: 34,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: "rgba(255,255,255,0.6)",
        marginTop: 4,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.5)",
        marginBottom: 24,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239,68,68,0.15)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: { color: "#fca5a5", fontSize: 13, flex: 1 },
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        marginBottom: 14,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },
    eyeIcon: { padding: 4 },
    signInButton: {
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 8,
    },
    buttonGradient: {
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 14,
    },
    signInButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    signUpLink: { alignItems: "center", marginTop: 20 },
    signUpLinkText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
    signUpHighlight: { color: "#16c98d", fontWeight: "700" },
});

export default SignInScreen;
