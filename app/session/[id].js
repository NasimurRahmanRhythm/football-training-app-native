import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sessions/${id}`);
      const data = await response.json();
      if (response.ok) {
        setSession(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load session details");
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Session deleted successfully");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) fetchSessionDetails();
    }, [id]),
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20E070" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Session not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPlayer = (player, index) => {
    const playerId = player._id || player.mongoId?._id || index;
    const playerName = player.name || player.mongoId?.name || "Unknown Player";
    const playerPosition =
      player.position || player.mongoId?.position || "Unknown Position";
    const profileImage =
      player.profileImage ||
      player.mongoId?.personalInfo?.profileImage ||
      null;

    return (
      <TouchableOpacity
        key={playerId}
        style={styles.playerCard}
        onPress={() =>
          router.push(
            `/player/${player._id || player.mongoId?._id || player.mongoId}`,
          )
        }
      >
        <View style={styles.playerMain}>
          <View style={styles.playerAvatar}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-circle" size={48} color="#20E070" />
            )}
          </View>
          <View style={styles.playerNameContainer}>
            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.playerRole}>{playerPosition}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{player.rating || 0}</Text>
          </View>
        </View>

        {(player.comment || player.goals > 0 || player.assists > 0) && (
          <View style={styles.playerStats}>
            {player.comment ? (
              <Text style={styles.playerComment}>"{player.comment}"</Text>
            ) : null}
            <View style={styles.statRows}>
              {player.goals > 0 && (
                <View style={styles.statChip}>
                  <Text style={styles.chipText}>⚽ {player.goals} Goals</Text>
                </View>
              )}
              {player.assists > 0 && (
                <View style={styles.statChip}>
                  <Text style={styles.chipText}>
                    👟 {player.assists} Assists
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#121212", "#0a0a0a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.circleBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#20E070" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => router.push(`/add-session?editId=${id}`)}
          >
            <Ionicons name="create-outline" size={24} color="#20E070" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.circleBtn, { marginLeft: 10 }]}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{session.type}</Text>
          </View>
          <Text style={styles.sessionTitle}>
            {session.type === "MATCH"
              ? `Vs ${session.opponent || "Unknown"}`
              : "Training Session"}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{formatDate(session.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{session.duration} mins</Text>
            </View>
          </View>
        </View>

        {/* Training Specific: Drills */}
        {session.type === "TRAINING" && session.drills?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drills Conducted</Text>
            {session.drills.map((drill, index) => (
              <View key={index}>
                <View style={styles.drillItem}>
                  <View style={styles.drillInfo}>
                    <Text style={styles.drillName}>{drill.name}</Text>
                    <Text style={styles.drillMeta}>
                      {drill.duration} mins • {drill.players?.length || 0}{" "}
                      players
                    </Text>
                  </View>
                  <Ionicons name="fitness-outline" size={20} color="#20E070" />
                </View>
                {/* Participating Players for this Drill */}
                {drill.players && drill.players.length > 0 && (
                  <View style={styles.drillPlayersContainer}>
                    {drill.players.map((p, playerIndex) =>
                      renderPlayer(p, playerIndex),
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Players List for Match */}
        {session.type === "MATCH" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Starting Squad</Text>
            {session.players?.map((p, i) => renderPlayer(p, i))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <Ionicons name="warning-outline" size={40} color="#ff4d4d" />
              <Text style={styles.confirmTitle}>Delete Session?</Text>
            </View>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={[styles.confirmBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteSession}
                disabled={isDeleting}
                style={[styles.confirmBtn, styles.deleteConfirmBtn]}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmBtnText}>Confirm</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#666",
    fontSize: 18,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "#20E070",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#000",
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 24,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(32, 224, 112, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(32, 224, 112, 0.3)",
    marginBottom: 16,
  },
  typeText: {
    color: "#20E070",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sessionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  drillItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 12,
  },
  drillName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  drillMeta: {
    color: "#666",
    fontSize: 13,
  },
  drillPlayersContainer: {
    backgroundColor: "rgba(32, 224, 112, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#20E070",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginLeft: 0,
  },
  playerCard: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 12,
    position: "relative",
  },
  playerMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#20E070",
    fontSize: 18,
    fontWeight: "700",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerNameContainer: {
    flex: 1,
  },
  playerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  playerRole: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  ratingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  playerStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  playerComment: {
    color: "#888",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginBottom: 10,
  },
  statRows: {
    flexDirection: "row",
    gap: 12,
  },
  statChip: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    color: "#eee",
    fontSize: 12,
    fontWeight: "600",
  },
  redirectArrow: {
    position: "absolute",
    right: 12,
    top: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  confirmTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
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
  deleteConfirmBtn: {
    backgroundColor: "#ff4d4d",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteConfirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
