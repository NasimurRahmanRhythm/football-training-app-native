import { API_BASE_URL } from "@/constants/ApplicationConstants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

const AddPlayerModal = ({
  visible,
  onClose,
  isVerified = true,
  playerData = null,
  isEditing = false,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [position, setPosition] = useState("");
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [organization, setOrganization] = useState("");
  const [showOrganizationPicker, setShowOrganizationPicker] = useState(false);
  const [organizationsList, setOrganizationsList] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/organization`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrganizationsList(data.organizations || []);
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    if (visible) {
      fetchOrganizations();
    }
  }, [visible]);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && playerData) {
      setName(playerData.name || "");
      setEmail(playerData.email || "");
      setPhone(playerData.phone || "");
      if (playerData.personalInfo) {
        setDob(
          playerData.personalInfo.dateOfBirth
            ? new Date(playerData.personalInfo.dateOfBirth)
            : new Date(),
        );
        setPosition(playerData.personalInfo.position || "");
        setOrganization(playerData.personalInfo.organization || "");
        setHeight(
          playerData.personalInfo.height
            ? String(playerData.personalInfo.height)
            : "",
        );
        setWeight(
          playerData.personalInfo.weight
            ? String(playerData.personalInfo.weight)
            : "",
        );
      }
    } else if (!visible) {
      // Reset only when closing, or you can keep it as is
    }
  }, [isEditing, playerData, visible]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === "ios");
    setDob(currentDate);
  };

  const handleSelectPosition = (pos) => {
    setPosition(pos);
    setShowPositionPicker(false);
  };

  const handleSelectOrganization = (org) => {
    setOrganization(org);
    setShowOrganizationPicker(false);
  };

  const handleSendInvitation = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:0|\+44)(?:\s*\d){9,10}$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid UK phone number (e.g., +44... or 0...).",
      );
      return;
    }

    setIsLoading(true);
    try {
      const personalInfo = {
        dateOfBirth: dob.toISOString().split("T")[0],
        position,
        height,
        weight,
        organization,
      };

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/user/${playerData._id}`
          : `${API_BASE_URL}/api/user`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            userType: "PLAYER",
            isVerified,
            personalInfo,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add player");
      }

      Alert.alert(
        "Success",
        isEditing
          ? "Player updated successfully."
          : isVerified
            ? "Player added successfully."
            : "Registration submitted! Awaiting verification.",
      );

      setName("");
      setEmail("");
      setPhone("");
      setDob(new Date());
      setPosition("");
      setOrganization("");
      setHeight("");
      setWeight("");

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
              <Text style={styles.title}>
                {isEditing
                  ? "Edit Player"
                  : isVerified
                    ? "Add a Player"
                    : "Register as Player"}
              </Text>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Player Name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="player@example.com"
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

              <Text style={styles.sectionTitle}>Personal Info</Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { marginRight: 10 }]}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: dob ? "#fff" : "#666" }}>
                      {dob.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dob}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Position</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowPositionPicker(true)}
                  >
                    <Text style={{ color: position ? "#fff" : "#666" }}>
                      {position || "Select Position"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Organization</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowOrganizationPicker(true)}
              >
                <Text style={{ color: organization ? "#fff" : "#666" }}>
                  {organization || "Select Organization"}
                </Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { marginRight: 10 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 180"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 75"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.btnWrapper,
                  (!name.trim() ||
                    !email.trim() ||
                    !phone.trim() ||
                    isLoading) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleSendInvitation}
                disabled={
                  !name.trim() || !email.trim() || !phone.trim() || isLoading
                }
              >
                <LinearGradient
                  colors={["#20E070", "#0DBF58"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.btnText}>
                    {isLoading
                      ? isEditing
                        ? "Updating..."
                        : isVerified
                          ? "Adding..."
                          : "Registering..."
                      : isEditing
                        ? "Update Player"
                        : isVerified
                          ? "Send Invitation"
                          : "Register"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Position Selection Modal */}
      <Modal
        visible={showPositionPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPositionPicker(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowPositionPicker(false)}
        >
          <View style={styles.dropdownContent}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Position</Text>
            </View>
            {POSITIONS.map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.dropdownOption,
                  position === pos && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleSelectPosition(pos)}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    position === pos && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {pos}
                </Text>
                {position === pos && <View style={styles.selectedMarker} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Organization Selection Modal */}
      <Modal
        visible={showOrganizationPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOrganizationPicker(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowOrganizationPicker(false)}
        >
          <View style={styles.dropdownContent}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Organization</Text>
            </View>
            {organizationsList.length === 0 ? (
              <Text style={{ color: "#888", padding: 20, textAlign: "center" }}>
                No organizations found.
              </Text>
            ) : (
              organizationsList.map((org) => (
                <TouchableOpacity
                  key={org}
                  style={[
                    styles.dropdownOption,
                    organization === org && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleSelectOrganization(org)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      organization === org && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {org}
                  </Text>
                  {organization === org && (
                    <View style={styles.selectedMarker} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    minHeight: "75%",
    maxHeight: "90%",
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
  sectionTitle: {
    color: "#20E070",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 16,
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
    marginBottom: 16,
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    flex: 1,
  },
  btnWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
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
  // Dropdown Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: "#1e1e1e",
    width: "100%",
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  dropdownHeader: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    alignItems: "center",
  },
  dropdownTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  dropdownOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(32, 224, 112, 0.05)",
  },
  dropdownOptionText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownOptionTextSelected: {
    color: "#20E070",
    fontWeight: "700",
  },
  selectedMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#20E070",
  },
});

export default AddPlayerModal;
