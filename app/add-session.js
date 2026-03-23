import DrillSelectionModal from "@/components/DrillSelectionModal";
import EvaluationModal from "@/components/EvaluationModal";
import PlayerSelectionModal from "@/components/PlayerSelectionModal";
import MatchSessionForm from "@/components/ui/MatchSessionForm";
import SessionDateSection from "@/components/ui/SessionDateSection";
import SessionHeader from "@/components/ui/SessionHeader";
import SessionTypeTabs from "@/components/ui/SessionTypeTabs";
import TrainingSessionForm from "@/components/ui/TrainingSessionForm";
import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddSessionScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const [sessionType, setSessionType] = useState("MATCH"); // 'MATCH' or 'TRAINING'
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!!editId);

  // Match State
  const [matchDuration, setMatchDuration] = useState(45);
  const [opponent, setOpponent] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Evaluation State
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [activeEvalPlayer, setActiveEvalPlayer] = useState(null);

  // Training State
  const [drills, setDrills] = useState([]); // { id, name, duration, players: [] }
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [currentDrillName, setCurrentDrillName] = useState(null);
  const [currentDrillDuration, setCurrentDrillDuration] = useState(30);
  const [editingDrillId, setEditingDrillId] = useState(null);

  const handleTabSwitch = (type) => {
    setSessionType(type);
    // Reset all state
    setSessionDate(new Date());
    setMatchDuration(45);
    setOpponent("");
    setSelectedPlayers([]);
    setDrills([]);
    setCurrentDrillName(null);
    setCurrentDrillDuration(30);
  };

  useEffect(() => {
    if (editId) {
      fetchSessionToEdit();
    }
  }, [editId]);

  const fetchSessionToEdit = async () => {
    try {
      setFetchingData(true);
      const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`);
      const data = await response.json();

      if (response.ok) {
        setSessionType(data.type);
        setSessionDate(new Date(data.date));
        setMatchDuration(data.duration || 45);
        setOpponent(data.opponent || "");

        if (data.type === "MATCH") {
          const mappedPlayers = data.players.map((p) => {
            const pid = String(p.mongoId?._id || p.mongoId || p._id || "");
            return {
              _id: pid,
              name: p.mongoId?.name || p.name,
              personalInfo: {
                position: p.mongoId?.personalInfo?.position || p.position,
              },
              rating: p.rating,
              comment: p.comment,
              goals: p.goals || 0,
              assists: p.assists || 0,
              cleansheet: p.cleansheet || false,
            };
          });
          setSelectedPlayers(mappedPlayers);
        } else {
          const mappedDrills = data.drills.map((d) => ({
            id: Date.now().toString() + Math.random(),
            name: d.name,
            duration: d.duration,
            players: d.players.map((p) => {
              const pid = String(p.mongoId?._id || p.mongoId || p._id || "");
              return {
                _id: pid,
                name: p.mongoId?.name || p.name,
                personalInfo: {
                  position: p.mongoId?.personalInfo?.position || p.position,
                },
                rating: p.rating,
                comment: p.comment,
              };
            }),
          }));
          setDrills(mappedDrills);
        }
      } else {
        Alert.alert("Error", "Failed to load session data for editing");
      }
    } catch (error) {
      console.error("Error fetching session for edit:", error);
      Alert.alert("Error", "Network error while loading session");
    } finally {
      setFetchingData(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSessionDate(selectedDate);
    }
  };

  const handleAddPlayers = (players) => {
    // Merge new selection with existing players to preserve state (ratings, etc.)
    const updatedPlayers = players.map((p) => {
      // Ensure we compare IDs as strings
      const playerStringId = String(p._id);
      const existing = selectedPlayers.find(
        (sp) => String(sp._id) === playerStringId,
      );
      if (existing) {
        return existing; // Return existing player with their rating/comment
      }
      // Return new player with default stats
      return {
        ...p,
        _id: playerStringId, // Ensure it's a string
        rating: 0,
        comment: "",
        goals: 0,
        assists: 0,
        cleansheet: false,
      };
    });
    setSelectedPlayers(updatedPlayers);
  };

  const handleFinishDrill = () => {
    if (!currentDrillName) return Alert.alert("Error", "Please select a drill");
    if (selectedPlayers.length === 0)
      return Alert.alert("Error", "Please add players to the drill");

    if (editingDrillId) {
      // Update existing drill
      setDrills((prev) =>
        prev.map((d) =>
          d.id === editingDrillId
            ? {
                ...d,
                name: currentDrillName,
                duration: currentDrillDuration,
                players: [...selectedPlayers],
              }
            : d,
        ),
      );
    } else {
      // Add new drill
      const newDrillEntry = {
        id: Date.now().toString() + Math.random().toString(),
        name: currentDrillName,
        duration: currentDrillDuration,
        players: [...selectedPlayers],
      };
      setDrills([...drills, newDrillEntry]);
    }

    // Reset for next drill
    setCurrentDrillName(null);
    setCurrentDrillDuration(30);
    setSelectedPlayers([]);
    setEditingDrillId(null);
  };

  const handleEditDrill = (drill) => {
    setEditingDrillId(drill.id);
    setCurrentDrillName(drill.name);
    setCurrentDrillDuration(drill.duration);
    setSelectedPlayers(drill.players);
    // Scroll can be handled if needed, but the box will appear filled
  };

  const handleDeleteDrill = (id) => {
    setDrills(drills.filter((d) => d.id !== id));
  };

  const saveEvaluation = (playerId, rating, comment, stats = {}) => {
    const stringPlayerId = String(playerId);
    setSelectedPlayers((prev) =>
      prev.map((p) =>
        String(p._id) === stringPlayerId
          ? { ...p, rating, comment, ...stats }
          : p,
      ),
    );
  };

  const isMatchValid =
    opponent.trim() !== "" &&
    selectedPlayers.length > 0 &&
    selectedPlayers.every((p) => (p.rating || 0) > 0);

  const isDrillValid =
    currentDrillName !== null &&
    selectedPlayers.length > 0 &&
    selectedPlayers.every((p) => (p.rating || 0) > 0);

  const isTrainingValid = drills.length > 0;

  const handleAddSession = async () => {
    // Validation
    if (sessionType === "MATCH") {
      if (!opponent.trim())
        return Alert.alert("Error", "Please enter opponent name");
      if (selectedPlayers.length === 0)
        return Alert.alert("Error", "Please add players");
    } else {
      if (drills.length === 0 && !currentDrillName)
        return Alert.alert("Error", "Please add at least one drill");

      // If there's an ongoing drill configuration, reminder
      if (currentDrillName && selectedPlayers.length > 0) {
        return Alert.alert(
          "Incomplete Drill",
          "Please finish adding the current drill or clear it before adding the session.",
        );
      }
    }

    const sessionData = {
      type: sessionType,
      date: sessionDate.toISOString(),
      duration:
        sessionType === "MATCH"
          ? matchDuration
          : drills.reduce((acc, d) => acc + d.duration, 0),
      opponent: sessionType === "MATCH" ? opponent : null,
      players:
        sessionType === "MATCH"
          ? selectedPlayers.map((p) => ({
              mongoId: p._id,
              rating: p.rating,
              comment: p.comment,
              goals: p.goals || 0,
              assists: p.assists || 0,
              cleansheet: p.cleansheet || false,
            }))
          : [],
      drills:
        sessionType === "TRAINING"
          ? drills.map((d) => ({
              name: d.name,
              duration: d.duration,
              players: d.players.map((p) => ({
                mongoId: p._id,
                rating: p.rating,
                comment: p.comment,
              })),
            }))
          : [],
    };

    console.log("FINAL SESSION DATA:", JSON.stringify(sessionData, null, 2));

    try {
      setLoading(true);
      const url = editId
        ? `${API_BASE_URL}/api/sessions/${editId}`
        : `${API_BASE_URL}/api/sessions`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          editId
            ? "Session updated successfully!"
            : "Session added successfully!",
        );
        router.back();
      } else {
        Alert.alert("Error", result.message || "Failed to add session");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20E070" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#121212", "#0a0a0a"]}
        style={StyleSheet.absoluteFill}
      />

      <SessionHeader
        onBack={() => router.back()}
        title={editId ? "Edit Session" : "New Session"}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Content from intro to form sections... */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>
              {editId ? "Edit Session" : "Add a Session"}
            </Text>
            <Text style={styles.introSubtitle}>
              {editId
                ? "Update the details of this session."
                : "Please select the type of session you want to record for today."}
            </Text>
          </View>

          {!editId && (
            <SessionTypeTabs
              sessionType={sessionType}
              onTabSwitch={handleTabSwitch}
            />
          )}

          <SessionDateSection
            sessionDate={sessionDate}
            showDatePicker={showDatePicker}
            onPress={() => setShowDatePicker(true)}
            onDateChange={onDateChange}
          />

          {sessionType === "MATCH" ? (
            <MatchSessionForm
              matchDuration={matchDuration}
              setMatchDuration={setMatchDuration}
              opponent={opponent}
              setOpponent={setOpponent}
              selectedPlayers={selectedPlayers}
              onAddMorePlayers={() => setShowPlayerModal(true)}
              onGiveEval={(player) => {
                setActiveEvalPlayer(player);
                setShowEvalModal(true);
              }}
            />
          ) : (
            <TrainingSessionForm
              drills={drills}
              currentDrillName={currentDrillName}
              editingDrillId={editingDrillId}
              onShowDrillModal={() => setShowDrillModal(true)}
              onResetCurrentDrill={() => {
                setCurrentDrillName(null);
                setCurrentDrillDuration(30);
                setSelectedPlayers([]);
                setEditingDrillId(null);
              }}
              currentDrillDuration={currentDrillDuration}
              setCurrentDrillDuration={setCurrentDrillDuration}
              selectedPlayers={selectedPlayers}
              onShowPlayerModal={() => setShowPlayerModal(true)}
              onGiveEval={(player) => {
                setActiveEvalPlayer(player);
                setShowEvalModal(true);
              }}
              isDrillValid={isDrillValid}
              onFinishDrill={handleFinishDrill}
              onEditDrill={handleEditDrill}
              onDeleteDrill={handleDeleteDrill}
            />
          )}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !(sessionType === "MATCH" ? isMatchValid : isTrainingValid) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleAddSession}
              disabled={
                !(sessionType === "MATCH" ? isMatchValid : isTrainingValid)
              }
            >
              <LinearGradient
                colors={["#20E070", "#0DBF58"]}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editId ? "Update Session" : "Add a Session"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <PlayerSelectionModal
        visible={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onAdd={handleAddPlayers}
        alreadySelected={selectedPlayers}
      />

      <DrillSelectionModal
        visible={showDrillModal}
        onClose={() => setShowDrillModal(false)}
        onSelect={setCurrentDrillName}
      />

      <EvaluationModal
        visible={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        player={activeEvalPlayer}
        onSave={saveEvaluation}
        sessionType={sessionType}
      />
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
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  introSubtitle: {
    color: "#888",
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientBtn: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
