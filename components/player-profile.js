import AddPlayerModal from "@/components/add-player-modal";
import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CROP_SIZE = SCREEN_WIDTH - 48; // square crop frame size

export default function PlayerProfile({
  id,
  onBack,
  onLogout,
  isEmbedded = false,
}) {
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cropAsset, setCropAsset] = useState(null); // holds picked image for pan UI
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const cropAssetRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStartRef.current = { ...panOffsetRef.current };
      },
      onPanResponderMove: (_, gs) => {
        const asset = cropAssetRef.current;
        if (!asset) return;
        const scale = CROP_SIZE / Math.min(asset.width, asset.height);
        const maxX = Math.max(0, (asset.width * scale - CROP_SIZE) / 2);
        const maxY = Math.max(0, (asset.height * scale - CROP_SIZE) / 2);
        const nx = Math.max(
          -maxX,
          Math.min(maxX, panStartRef.current.x + gs.dx),
        );
        const ny = Math.max(
          -maxY,
          Math.min(maxY, panStartRef.current.y + gs.dy),
        );
        panOffsetRef.current = { x: nx, y: ny };
        setPanOffset({ x: nx, y: ny });
      },
    }),
  ).current;

  const isCoach = loggedInUser?.userType === "COACH";
  const isOwnProfile =
    loggedInUser &&
    id &&
    (String(loggedInUser._id) === String(id) ||
      String(loggedInUser.id) === String(id));

  useEffect(() => {
    // Redirection check for players attempting to access other profiles
    if (loggedInUser && !isCoach && loggedInUser._id !== id) {
      // In embedded mode we might not want to redirect, but this is a good safety
      if (!isEmbedded) {
        router.replace(`/player/${loggedInUser._id}`);
        return;
      }
    }
    fetchPlayerDetails();
  }, [id, loggedInUser]);

  const fetchPlayerDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/${id}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setPlayer(data.user);
        if (data.user?.personalInfo?.profileImage) {
          setProfileImageUrl(data.user.personalInfo.profileImage);
        }
      } else {
        console.error("Failed to fetch player:", data.message);
      }
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickProfileImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "Please allow access to your photo library to upload a profile picture.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      // Reset pan and open the repositioning modal
      panOffsetRef.current = { x: 0, y: 0 };
      setPanOffset({ x: 0, y: 0 });
      cropAssetRef.current = asset;
      setCropAsset(asset);
    } catch (error) {
      Alert.alert("Error", error.message || "Could not open gallery.");
    }
  };

  const handleCropAndUpload = async () => {
    if (!cropAsset) return;
    setCropAsset(null);
    setIsUploadingImage(true);
    try {
      const { width, height } = cropAsset;
      const scale = CROP_SIZE / Math.min(width, height);
      const displayWidth = width * scale;
      const displayHeight = height * scale;
      const maxX = Math.max(0, (displayWidth - CROP_SIZE) / 2);
      const maxY = Math.max(0, (displayHeight - CROP_SIZE) / 2);
      // Convert screen pan offset → image pixel offset
      const originX = Math.floor((maxX - panOffsetRef.current.x) / scale);
      const originY = Math.floor((maxY - panOffsetRef.current.y) / scale);
      const cropPx = Math.floor(CROP_SIZE / scale);
      const safeX = Math.max(0, Math.min(originX, width - cropPx));
      const safeY = Math.max(0, Math.min(originY, height - cropPx));
      const manipulated = await ImageManipulator.manipulateAsync(
        cropAsset.uri,
        [
          {
            crop: {
              originX: safeX,
              originY: safeY,
              width: cropPx,
              height: cropPx,
            },
          },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      const formData = new FormData();
      formData.append("image", {
        uri: manipulated.uri,
        name: cropAsset.fileName || `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      const response = await fetch(
        `${API_BASE_URL}/api/user/${id}/profile-image`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setProfileImageUrl(data.profileImage);
        Alert.alert("Success", "Profile picture updated!");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("[UPLOAD ERROR]", error);
      Alert.alert("Error", error.message || "Could not upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeletePlayer = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${loggedInUser?.token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          isOwnProfile
            ? "Your account has been deleted successfully."
            : "Player deleted successfully.",
        );
        if (isOwnProfile) {
          if (onLogout) onLogout();
          // Fallback if useAuth isn't injected here, but onLogout is usually provided
        } else {
          if (onBack) onBack();
          else router.back();
        }
      } else {
        throw new Error(data.message || "Failed to delete player");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20E070" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Player not found</Text>
        {!isEmbedded && (
          <TouchableOpacity
            onPress={() => (onBack ? onBack() : router.back())}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const matchSessions =
    player.sessions?.filter((s) => s.type === "MATCH") || [];
  const trainingSessions =
    player.sessions?.filter((s) => s.type === "TRAINING") || [];

  const StatCard = ({ label, value, color = "#20E070", icon }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
        style={styles.statCardInner}
      >
        <Ionicons name={icon} size={20} color={color} style={styles.statIcon} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[styles.container, isEmbedded && styles.embeddedContainer]}>
      {!isEmbedded && (
        <LinearGradient
          colors={["#0a0a0a", "#121212"]}
          style={StyleSheet.absoluteFill}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Section */}
        <ImageBackground
          source={require("../assets/profile-top-images/IMG_20220326_185226_935.jpg.jpeg")}
          style={styles.headerImage}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "#0a0a0a"]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={["top"]} style={styles.headerContent}>
            {isCoach && !isEmbedded && (
              <TouchableOpacity
                onPress={() => (onBack ? onBack() : router.back())}
                style={styles.backBtn}
              >
                <View style={styles.backBtnInner}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            )}

            <View
              style={[
                styles.headerActions,
                (!isCoach || isEmbedded) && {
                  flex: 1,
                  justifyContent: "flex-end",
                },
              ]}
            >
              {isEmbedded && onLogout && (
                <TouchableOpacity onPress={onLogout} style={styles.actionBtn}>
                  <View style={styles.actionBtnInner}>
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#ff4d4d"
                    />
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowEditModal(true)}
                style={styles.actionBtn}
              >
                <View style={styles.actionBtnInner}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
              {(isCoach || isOwnProfile) && (
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirm(true)}
                  style={styles.actionBtn}
                >
                  <View style={styles.actionBtnInner}>
                    <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={["#20E070", "#0DBF58"]}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {player.name?.[0]?.toUpperCase() || "P"}
                  </Text>
                )}
              </View>
            </LinearGradient>
            {/* Camera upload button — visible for own profile & coaches */}
            {(isOwnProfile || isCoach) && (
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handlePickProfileImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={14} color="#fff" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.nameText}>{player.name}</Text>
          <Text style={styles.emailText}>{player.email}</Text>
          {player.personalInfo?.organization && (
            <Text style={styles.emailText}>
              {player.personalInfo.organization}
            </Text>
          )}

          <View style={styles.personalInfoRow}>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>Position</Text>
              <Text style={styles.infoPillValue}>
                {player.personalInfo?.position || "N/A"}
              </Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>Age</Text>
              <Text style={styles.infoPillValue}>
                {calculateAge(player.personalInfo?.dateOfBirth)}
              </Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>H/W</Text>
              <Text style={styles.infoPillValue}>
                {player.personalInfo?.height || "-"}/
                {player.personalInfo?.weight || "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.gridRow}>
            <StatCard
              icon="star"
              label="Total Avg"
              value={player.totalAvgRating?.toFixed(1) || "0.0"}
              color="#20E070"
            />
            <StatCard
              icon="trophy"
              label="Match Avg"
              value={player.matchAvgRating?.toFixed(1) || "0.0"}
              color="#FFD700"
            />
            <StatCard
              icon="fitness"
              label="Train Avg"
              value={player.trainingAvgRating?.toFixed(1) || "0.0"}
              color="#00D4FF"
            />
          </View>
          <View style={[styles.gridRow, { marginTop: 12 }]}>
            <StatCard
              icon="football"
              label="Total Goals"
              value={player.totalGoals || 0}
              color="#FF4D4D"
            />
            <StatCard
              icon="gift"
              label="Total Assists"
              value={player.totalAssists || 0}
              color="#A855F7"
            />
          </View>
        </View>

        {/* Sessions Section */}
        <View style={styles.sessionsWrapper}>
          {/* Match Sessions */}
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={22} color="#FFD700" />
            <Text style={styles.sectionTitle}>Match Sessions</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{matchSessions.length}</Text>
            </View>
          </View>

          {matchSessions.length > 0 ? (
            matchSessions.map((session, idx) => (
              <View key={session._id || idx} style={styles.sessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.date)}
                    </Text>
                    <Text style={styles.opponentText}>
                      vs {session.opponent}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      {session.playerRating?.toFixed(1) || "-"}
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.detailText}>
                      {session.duration} min
                    </Text>
                  </View>
                  <View style={styles.detailSeparator} />
                  <View style={styles.detailItem}>
                    <Ionicons name="football-outline" size={14} color="#888" />
                    <Text style={styles.detailText}>
                      {session.myPerformance?.goals || 0} G /{" "}
                      {session.myPerformance?.assists || 0} A
                    </Text>
                  </View>
                </View>
                {session.myPerformance?.comment && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText} numberOfLines={2}>
                      "{session.myPerformance.comment}"
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptySessions}>No match sessions recorded</Text>
          )}

          {/* Training Sessions */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Ionicons name="fitness-outline" size={22} color="#00D4FF" />
            <Text style={styles.sectionTitle}>Training Sessions</Text>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: "rgba(0, 212, 255, 0.1)" },
              ]}
            >
              <Text style={[styles.countText, { color: "#00D4FF" }]}>
                {trainingSessions.length}
              </Text>
            </View>
          </View>

          {trainingSessions.length > 0 ? (
            trainingSessions.map((session, idx) => (
              <View key={session._id || idx} style={styles.sessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.date)}
                    </Text>
                    <Text style={styles.opponentText}>Training Session</Text>
                  </View>
                  <View
                    style={[
                      styles.ratingBadge,
                      { backgroundColor: "rgba(0, 212, 255, 0.1)" },
                    ]}
                  >
                    <Text style={[styles.ratingText, { color: "#00D4FF" }]}>
                      {session.playerRating?.toFixed(1) || "-"}
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.detailText}>
                      {session.duration} min
                    </Text>
                  </View>
                  <View style={styles.detailSeparator} />
                  <View style={styles.detailItem}>
                    <Ionicons name="layers-outline" size={14} color="#888" />
                    <Text style={styles.detailText}>
                      {session.myPerformance?.length || 0} Drills
                    </Text>
                  </View>
                </View>

                {session.myPerformance?.map((drill, dIdx) => (
                  <View key={dIdx} style={styles.drillItem}>
                    <View style={styles.drillHeader}>
                      <Text style={styles.drillName}>{drill.name}</Text>
                      <Text style={styles.drillRating}>
                        {drill.performance?.rating}/5
                      </Text>
                    </View>
                    {drill.performance?.comment && (
                      <Text style={styles.drillComment}>
                        {drill.performance.comment}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.emptySessions}>
              No training sessions recorded
            </Text>
          )}

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      {/* Edit Player Modal */}
      <AddPlayerModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          fetchPlayerDetails(); // Refresh data after edit
        }}
        playerData={player}
        isEditing={true}
      />

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
              <Text style={styles.confirmTitle}>Delete Player?</Text>
            </View>
            <Text style={styles.confirmMessage}>
              {isOwnProfile
                ? "Are you sure you want to delete your account? This action cannot be undone."
                : `Are you sure you want to delete ${player.name}? This action cannot be undone.`}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={[styles.confirmBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeletePlayer}
                disabled={isDeleting}
                style={[styles.confirmBtn, styles.deleteConfirmBtn]}
              >
                <Text style={styles.deleteConfirmBtnText}>
                  {isDeleting ? "Deleting..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pan-to-Reposition Crop Modal */}
      <Modal
        visible={!!cropAsset}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setCropAsset(null)}
      >
        <View style={styles.cropModalContainer}>
          <View style={styles.cropHeader}>
            <TouchableOpacity
              onPress={() => setCropAsset(null)}
              style={styles.cropCloseBtn}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cropTitle}>Position Photo</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.cropHint}>Drag to reposition</Text>

          {/* Square crop frame – drag image inside it */}
          {cropAsset &&
            (() => {
              const scale =
                CROP_SIZE / Math.min(cropAsset.width, cropAsset.height);
              const dispW = cropAsset.width * scale;
              const dispH = cropAsset.height * scale;
              return (
                <View
                  style={[
                    styles.cropFrame,
                    { width: CROP_SIZE, height: CROP_SIZE },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Image
                    source={{ uri: cropAsset.uri }}
                    style={{
                      width: dispW,
                      height: dispH,
                      transform: [
                        { translateX: panOffset.x },
                        { translateY: panOffset.y },
                      ],
                    }}
                  />
                  {/* Corner markers */}
                  <View
                    pointerEvents="none"
                    style={[styles.corner, styles.cornerTL]}
                  />
                  <View
                    pointerEvents="none"
                    style={[styles.corner, styles.cornerTR]}
                  />
                  <View
                    pointerEvents="none"
                    style={[styles.corner, styles.cornerBL]}
                  />
                  <View
                    pointerEvents="none"
                    style={[styles.corner, styles.cornerBR]}
                  />
                </View>
              );
            })()}

          <View style={styles.cropActions}>
            <TouchableOpacity
              style={styles.cropCancelBtn}
              onPress={() => setCropAsset(null)}
            >
              <Text style={styles.cropCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cropConfirmBtn}
              onPress={handleCropAndUpload}
              disabled={isUploadingImage}
            >
              <Text style={styles.cropConfirmText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  embeddedContainer: {
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#222",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerImage: {
    height: 200,
    width: "100%",
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  actionBtnInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backBtn: {
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  backBtnInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  profileSection: {
    alignItems: "center",
    marginTop: -50,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: "#0a0a0a",
    position: "relative",
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 50,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#20E070",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a0a0a",
  },
  nameText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginTop: 16,
    letterSpacing: -0.5,
  },
  emailText: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  personalInfoRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  infoPill: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
    minWidth: 80,
  },
  infoPillLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoPillValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
    marginTop: 2,
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statCardInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    fontWeight: "600",
  },
  sessionsWrapper: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 10,
    flex: 1,
  },
  countBadge: {
    backgroundColor: "rgba(32, 224, 112, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: "#20E070",
    fontSize: 13,
    fontWeight: "700",
  },
  sessionCard: {
    backgroundColor: "#161616",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionDate: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  opponentText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: "rgba(32, 224, 112, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 44,
    alignItems: "center",
  },
  ratingText: {
    color: "#20E070",
    fontSize: 15,
    fontWeight: "800",
  },
  sessionDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
  },
  detailText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  commentBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#20E070",
  },
  commentText: {
    fontSize: 13,
    color: "#bbb",
    fontStyle: "italic",
    lineHeight: 18,
  },
  drillItem: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  drillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drillName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  drillRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#20E070",
  },
  drillComment: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    lineHeight: 18,
  },
  emptySessions: {
    textAlign: "center",
    color: "#444",
    fontSize: 14,
    marginVertical: 20,
    fontStyle: "italic",
  },
  // Confirmation Modal Styles
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
  // Crop / Reposition Modal Styles
  cropModalContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  cropHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  cropCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cropTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cropHint: {
    color: "#666",
    fontSize: 13,
    marginBottom: 20,
  },
  cropFrame: {
    overflow: "hidden",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  // Corner bracket markers
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#20E070",
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  cropActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 24,
    width: "100%",
  },
  cropCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
  },
  cropCancelText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "700",
  },
  cropConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#20E070",
  },
  cropConfirmText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },
});
