import { API_BASE_URL } from "@/constants/ApplicationConstants"; // Added API_BASE_URL import
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddCoachModal = ({ visible, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendInvitation = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:0|\+44)(?:\s*\d){9,10}$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      Alert.alert("Invalid Phone Number", "Please enter a valid UK phone number (e.g., +44... or 0...).");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          userType: "COACH",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add coach");
      }

      Alert.alert("Success", "Coach added successfully.");
      setName("");
      setEmail("");
      setPhone("");
      onClose();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={{ width: 30 }} />
              <Text style={styles.title}>Add a Coach</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Coach Name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="coach@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+44 7123 456789"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TouchableOpacity
                style={[
                  styles.btnWrapper,
                  (!name.trim() || !email.trim() || !phone.trim() || isLoading) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleSendInvitation}
                disabled={!name.trim() || !email.trim() || !phone.trim() || isLoading}
              >
                <LinearGradient
                  colors={["#20E070", "#0DBF58"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.btnText}>
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    minHeight: "50%",
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
  closeButton: { fontSize: 16, color: "#aaa", fontWeight: "bold" },
  title: { fontSize: 18, fontWeight: "700", color: "#fff" },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
    color: "#fff",
  },
  btnWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
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
  },
});

export default AddCoachModal;
