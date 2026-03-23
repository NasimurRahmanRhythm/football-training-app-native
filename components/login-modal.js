import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTP_LENGTH = 6;

const OtpInput = ({ code, setCode }) => {
  const inputRef = useRef(null);

  const handlePress = () => {
    // If keyboard is accidentally dismissed, blurring then focusing ensures it reopens
    inputRef.current?.blur();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <View style={styles.otpWrapper}>
      <Pressable onPress={handlePress} style={styles.otpContainer}>
        {Array(OTP_LENGTH)
          .fill(0)
          .map((_, index) => {
            const isFilled = index < code.length;
            const isActive = index === code.length;
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isFilled && styles.otpBoxFilled,
                  isActive && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpText}>{code[index] || ""}</Text>
              </View>
            );
          })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(text) => {
          // Only allow numbers
          const numericValue = text.replace(/[^0-9]/g, "");
          setCode(numericValue);
        }}
        maxLength={OTP_LENGTH}
        keyboardType="number-pad"
        style={styles.hiddenInput}
        autoFocus
      />
    </View>
  );
};

const LoginModal = ({ visible, onClose, onVerifySuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && step === "otp") {
      setIsResendDisabled(true);
    }
  }, [timeLeft, step]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Email validation
  const isValidEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Handle send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setStep("otp");
      setTimeLeft(120);
      setIsResendDisabled(false);
    } catch (error) {
      Alert.alert("Oops!", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Store in global AuthContext
      login(data.user || { email });
      onVerifySuccess();
      resetForm();
    } catch (error) {
      Alert.alert("Verification Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    if (isResendDisabled && timeLeft > 0) {
      return;
    }

    // TODO: Call backend API to resend OTP
    console.log("Resending OTP to:", email);
    setTimeLeft(120);
    setIsResendDisabled(false);
  };

  // Reset form
  const resetForm = () => {
    setEmail("");
    setOtp("");
    setStep("email");
    setTimeLeft(120);
    setIsResendDisabled(false);
  };

  // Handle close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ width: 30 }} />
              <Text style={styles.title}>
                {step === "email" ? "Sign In" : "Verification"}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Email Step */}
            {step === "email" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Welcome Back</Text>
                <Text style={styles.stepDescription}>
                  Enter your email address to receive a one-time password.
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    !isValidEmail(email) && email.trim() && styles.inputError,
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {!isValidEmail(email) && email.trim() && (
                  <Text style={styles.errorMessage}>
                    Please enter a valid email address
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.btnWrapper,
                    (!isValidEmail(email) || isLoading) && { opacity: 0.5 },
                  ]}
                  onPress={handleSendOtp}
                  disabled={!isValidEmail(email) || isLoading}
                >
                  <LinearGradient
                    colors={["#20E070", "#0DBF58"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.btnText}>
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Enter OTP</Text>
                <Text style={styles.stepDescription}>
                  We've sent a 6-digit code to{"\n"}
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {email}
                  </Text>
                </Text>

                <OtpInput code={otp} setCode={setOtp} />

                {/* Timer */}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.btnWrapper,
                    (otp.length !== OTP_LENGTH || isLoading) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== OTP_LENGTH || isLoading}
                >
                  <LinearGradient
                    colors={["#20E070", "#0DBF58"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.btnText}>
                      {isLoading ? "Verifying..." : "Verify & Login"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend & Change Email */}
                <View style={styles.footerActions}>
                  {timeLeft > 0 ? (
                    <Text style={styles.resendText}>
                      Resend code in{" "}
                      <Text style={{ color: "#20E070" }}>
                        {formatTime(timeLeft)}
                      </Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text style={styles.resendButton}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setStep("email")}
                    style={styles.changeEmailObj}
                  >
                    <Text style={styles.changeEmailButton}>Change Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    minHeight: "55%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    borderRadius: 16,
  },
  closeButton: {
    fontSize: 16,
    color: "#aaa",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: "#888",
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorMessage: {
    color: "#ff4444",
    fontSize: 13,
    marginBottom: 16,
    marginTop: -4,
  },
  btnWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#20E070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 10,
  },
  gradientBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // OTP 6-box styling
  otpWrapper: {
    marginVertical: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: "#20E070",
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
  },
  otpText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    left: -1000,
  },

  timerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  timerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
  },
  footerActions: {
    alignItems: "center",
    marginTop: 24,
    gap: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#888",
  },
  resendButton: {
    color: "#20E070",
    fontSize: 15,
    fontWeight: "700",
  },
  changeEmailObj: {
    paddingTop: 8,
  },
  changeEmailButton: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default LoginModal;
