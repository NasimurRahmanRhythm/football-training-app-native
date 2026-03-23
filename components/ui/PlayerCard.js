import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PlayerCard = ({ player, onEvalPress }) => {
  return (
    <View style={styles.selectedPlayerCard}>
      <View>
        <Text style={styles.selectedPlayerName}>{player.name}</Text>
        <View style={styles.playerMetaRow}>
          {player?.personalInfo?.position && (
            <Text style={styles.playerPosSmall}>
              {player.personalInfo.position}
            </Text>
          )}
          {player?.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#20E070" />
              <Text style={styles.ratingBadgeText}>{player.rating}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.giveEvalBtn} onPress={onEvalPress}>
        <Text style={styles.giveEvalBtnText}>
          {player.rating > 0 ? "Edit Eval" : "Give Evaluation"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedPlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  selectedPlayerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  giveEvalBtn: {
    backgroundColor: "rgba(32, 224, 112, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(32, 224, 112, 0.2)",
  },
  giveEvalBtnText: {
    color: "#20E070",
    fontSize: 13,
    fontWeight: "600",
  },
  playerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  playerPosSmall: {
    color: "#666",
    fontSize: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(32, 224, 112, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingBadgeText: {
    color: "#20E070",
    fontSize: 11,
    fontWeight: "700",
  },
});

export default PlayerCard;
