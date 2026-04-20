import AddCoachModal from "@/components/add-coach-modal";
import AddPlayerModal from "@/components/add-player-modal";
import PlayerProfile from "@/components/player-profile";
import {
  API_BASE_URL,
  SUPER_ADMIN_EMAIL,
} from "@/constants/ApplicationConstants";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isAddPlayerVisible, setIsAddPlayerVisible] = useState(false);
  const [isAddCoachVisible, setIsAddCoachVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAddOrgVisible, setIsAddOrgVisible] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleAddOrganization = async () => {
    if (!orgName.trim()) return;
    setIsAddingOrg(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/organization`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization: orgName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add organization");
      }

      Alert.alert("Success", "Organization added successfully!");
      setOrgName("");
      setIsAddOrgVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsAddingOrg(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      // Even if API fails (e.g. invalid token), we want to logout locally
      await logout();
      setIsLogoutModalVisible(false);
    } catch (error) {
      console.error("Logout Error:", error);
      // Fallback: still logout locally if network fails
      await logout();
      setIsLogoutModalVisible(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id && !user?._id) return;
    const userId = user.id || user._id;

    setIsDeletingAccount(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      Alert.alert("Success", "Your account has been deleted successfully.");
      await logout();
      setIsDeleteAccountModalVisible(false);
    } catch (error) {
      console.error("Delete Account Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const renderCoachView = () => (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => router.push("/members")}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>View All Members</Text>
          <Text style={styles.buttonDescription}>
            Browse all registered players and coaches
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setIsAddPlayerVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>Add a Player</Text>
          <Text style={styles.buttonDescription}>Register a new player</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setIsAddCoachVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>Add a Coach</Text>
          <Text style={styles.buttonDescription}>
            Register a new coach to your staff
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>

      {user?.email === SUPER_ADMIN_EMAIL && (
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => setIsAddOrgVisible(true)}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>Add an Organization</Text>
            <Text style={styles.buttonDescription}>
              Register a new organization
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#444" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => router.push("/add-session")}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>Add a Session</Text>
          <Text style={styles.buttonDescription}>
            Record a new match or training
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainButton, { marginBottom: 20 }]}
        onPress={() => router.push("/sessions")}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>View All Sessions</Text>
          <Text style={styles.buttonDescription}>
            History of all recorded sessions
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#121212", "#0a0a0a"]}
        style={StyleSheet.absoluteFill}
      />
      {/* Header with Logout Button */}
      {/* Header with Logout Button - Only for Coaches */}
      {user?.userType === "COACH" && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Football Training</Text>
          <View style={styles.headerActions}>
            {user?.email !== SUPER_ADMIN_EMAIL && (
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setIsDeleteAccountModalVisible(true)}
              >
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {user?.userType === "COACH" ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Manage your football training program
            </Text>
          </View>

          {renderCoachView()}
        </ScrollView>
      ) : (
        <PlayerProfile
          id={user?.id}
          isEmbedded={true}
          onLogout={handleLogout}
        />
      )}

      {/* Modals */}
      <AddPlayerModal
        visible={isAddPlayerVisible}
        onClose={() => setIsAddPlayerVisible(false)}
      />
      <AddCoachModal
        visible={isAddCoachVisible}
        onClose={() => setIsAddCoachVisible(false)}
      />

      {/* Add Organization Modal */}
      <Modal
        visible={isAddOrgVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddOrgVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Add Organization</Text>
            </View>
            <View style={{ width: "100%", marginBottom: 20 }}>
              <TextInput
                style={{
                  backgroundColor: "#222",
                  color: "#fff",
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#333",
                  fontSize: 16,
                }}
                placeholder="Organization Name"
                placeholderTextColor="#666"
                value={orgName}
                onChangeText={setOrgName}
              />
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setIsAddOrgVisible(false)}
                style={[styles.confirmBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddOrganization}
                disabled={!orgName.trim() || isAddingOrg}
                style={[
                  styles.confirmBtn,
                  { backgroundColor: "#20E070" },
                  (!orgName.trim() || isAddingOrg) && { opacity: 0.5 },
                ]}
              >
                {isAddingOrg ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.cancelBtnText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="log-out-outline" size={32} color="#ff4444" />
              </View>
              <Text style={styles.confirmTitle}>Logout</Text>
            </View>
            <Text style={styles.confirmMessage}>
              Are you sure you want to logout? You will need to sign in again to
              access your data.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setIsLogoutModalVisible(false)}
                style={[styles.confirmBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                disabled={isLoggingOut}
                style={[styles.confirmBtn, styles.logoutConfirmBtn]}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.logoutConfirmBtnText}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={isDeleteAccountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="trash-outline" size={32} color="#ff4444" />
              </View>
              <Text style={styles.confirmTitle}>Delete Account</Text>
            </View>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setIsDeleteAccountModalVisible(false)}
                style={[styles.confirmBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteAccount}
                disabled={isDeletingAccount}
                style={[styles.confirmBtn, styles.logoutConfirmBtn]}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.logoutConfirmBtnText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginTop: 16,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBtn: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 32,
    marginTop: 10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#888",
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
  },
  mainButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#222",
  },
  borderButton: {
    backgroundColor: "#111",
    borderWidth: 1,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmModal: {
    backgroundColor: "#1a1a1a",
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  confirmHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  confirmMessage: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#222",
  },
  logoutConfirmBtn: {
    backgroundColor: "#ff4444",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutConfirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
