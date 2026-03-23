import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("PLAYER"); // 'PLAYER', 'COACH', or 'PENDING_PLAYER'
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
      return () => {};
    }, [activeTab]),
  );

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user?userType=${activeTab}`,
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setMembers(data.users || []);
      } else {
        console.error("Failed to fetch members:", data.message);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPlayer = async () => {
    if (!selectedPlayer) return;
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${selectedPlayer._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVerified: true }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        setIsAcceptModalVisible(false);
        fetchMembers();
      } else {
        alert(data.message || "Failed to accept player");
      }
    } catch (error) {
      console.error("Error accepting player:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
      setSelectedPlayer(null);
    }
  };

  // Frontend search filter logic
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const nameMatch = member.name?.toLowerCase().includes(query);

      if (activeTab === "PLAYER") {
        const positionMatch =
          member.position?.toLowerCase().includes(query) ||
          member.personalInfo?.position?.toLowerCase().includes(query);
        return nameMatch || positionMatch;
      }

      if (activeTab === "PENDING_PLAYER") {
        const emailMatch = member.email?.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      }

      return nameMatch;
    });
  }, [members, searchQuery, activeTab]);

  const renderMemberItem = ({ item }) => {
    if (activeTab === "PLAYER") {
      return (
        <View style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberSubtext}>
              {item?.personalInfo?.position ||
                item?.position ||
                "No Position Available"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/player/${item._id}`)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === "PENDING_PLAYER") {
      return (
        <TouchableOpacity
          style={styles.memberCard}
          onPress={() => router.push(`/player/${item._id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberSubtext}>
              {item.email || "No Email Available"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card navigation when clicking Accept
              setSelectedPlayer(item);
              setIsAcceptModalVisible(true);
            }}
          >
            <Text style={styles.viewButtonText}>Accept</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberSubtext}>
              {item.email || "No Email Available"}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#121212", "#0a0a0a"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#20E070" />
        </TouchableOpacity>

        <Text style={styles.pageDescription}>
          Manage and view all registered staff and players in your organization.
        </Text>

        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "PLAYER" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("PLAYER")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "PLAYER" && styles.activeTabText,
              ]}
            >
              Players
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "COACH" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("COACH")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "COACH" && styles.activeTabText,
              ]}
            >
              Coaches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "PENDING_PLAYER" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("PENDING_PLAYER")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "PENDING_PLAYER" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={
                activeTab === "PLAYER"
                  ? "Search name or position..."
                  : activeTab === "PENDING_PLAYER"
                    ? "Search name or email..."
                    : "Search name..."
              }
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Member List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#20E070" />
          </View>
        ) : filteredMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery ? "search-outline" : "people-outline"}
              size={48}
              color="#333"
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : activeTab === "PENDING_PLAYER"
                  ? "No pending registrations."
                  : `No ${activeTab.toLowerCase()}s found.`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredMembers}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Accept Confirmation Modal */}
      <View>
        <Modal
          visible={isAcceptModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAcceptModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Accept Player</Text>
              <Text style={styles.modalDescription}>
                Do you want to accept this player to the academy?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsAcceptModalVisible(false)}
                  disabled={isProcessing}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAcceptPlayer}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Yes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  backButton: {
    paddingVertical: 10,
    marginBottom: 10,
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageDescription: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    lineHeight: 28,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#2b2b2b",
  },
  tabText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },

  // Search Styles
  searchWrapper: {
    marginBottom: 24,
  },
  searchLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 15,
  },

  listContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  memberSubtext: {
    color: "#888",
    fontSize: 13,
  },
  viewButton: {
    backgroundColor: "rgba(32, 224, 112, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(32, 224, 112, 0.3)",
  },
  viewButtonText: {
    color: "#20E070",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#222",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalDescription: {
    color: "#888",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#222",
  },
  cancelButtonText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#20E070",
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});
