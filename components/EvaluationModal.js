import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Counter = ({ label, value, onIncrease, onDecrease }) => (
  <View style={styles.counterRow}>
    <Text style={styles.counterLabel}>{label}</Text>
    <View style={styles.counterControls}>
      <TouchableOpacity onPress={onDecrease} style={styles.counterBtn}>
        <Ionicons name="remove" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.counterValue}>{value}</Text>
      <TouchableOpacity onPress={onIncrease} style={styles.counterBtn}>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const EvaluationModal = ({ visible, onClose, player, onSave, sessionType }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [cleansheet, setCleansheet] = useState(false);

  useEffect(() => {
    if (visible && player) {
      setRating(player.rating || 0);
      setComment(player.comment || "");
      setGoals(player.goals || 0);
      setAssists(player.assists || 0);
      setCleansheet(player.cleansheet || false);
    }
  }, [visible, player]);

  const handleSave = () => {
    if (player && player._id) {
      onSave(player._id, rating, comment, {
        goals,
        assists,
        cleansheet,
      });
    }
    onClose();
  };

  if (!player) return null;

  const isGoalkeeper =
    player?.personalInfo?.position?.toLowerCase() === "goalkeeper" ||
    player?.position?.toLowerCase() === "goalkeeper";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Evaluation: {player?.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.evalLabel}>Rating</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={star <= rating ? "#20E070" : "#333"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {sessionType === "MATCH" && (
              <View style={styles.statsSection}>
                <Counter
                  label="Goals"
                  value={goals}
                  onIncrease={() => setGoals((g) => g + 1)}
                  onDecrease={() => setGoals((g) => Math.max(0, g - 1))}
                />
                <Counter
                  label="Assists"
                  value={assists}
                  onIncrease={() => setAssists((a) => a + 1)}
                  onDecrease={() => setAssists((a) => Math.max(0, a - 1))}
                />

                {isGoalkeeper && (
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setCleansheet(!cleansheet)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.counterLabel}>Cleansheet</Text>
                    <View
                      style={[
                        styles.checkbox,
                        cleansheet && styles.checkboxActive,
                      ]}
                    >
                      {cleansheet && (
                        <Ionicons name="checkmark" size={16} color="#000" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.evalLabel}>Comments</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write evaluation here..."
              placeholderTextColor="#666"
              multiline
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={[
                styles.modalAddBtn,
                rating === 0 && { opacity: 0.5, backgroundColor: "#666" },
              ]}
              onPress={handleSave}
              disabled={rating === 0}
            >
              <Text style={styles.modalAddBtnText}>Save Evaluation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  evalLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 10,
  },
  statsSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    gap: 16,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    minWidth: 25,
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#20E070",
    borderColor: "#20E070",
  },
  commentInput: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    padding: 16,
    height: 100,
    color: "#fff",
    fontSize: 15,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  modalAddBtn: {
    backgroundColor: "#20E070",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  modalAddBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default EvaluationModal;
