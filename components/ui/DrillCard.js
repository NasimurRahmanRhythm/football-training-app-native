import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DrillCard = ({ drill, index, onEdit, onDelete }) => {
  return (
    <View style={styles.drillCard}>
      <View style={styles.drillCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.drillCardTitle}>
            {index + 1}. {drill.name}
          </Text>
          <Text style={styles.drillCardDuration}>{drill.duration} mins</Text>
        </View>
        <View style={styles.drillActions}>
          <TouchableOpacity onPress={onEdit} style={styles.editDrillBtn}>
            <Ionicons name="create-outline" size={20} color="#20E070" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.deleteDrillBtn}>
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.drillCardPlayers}>
        {drill.players.length} players evaluated
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  drillCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  drillCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  drillCardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  drillCardDuration: {
    color: "#20E070",
    fontSize: 13,
    fontWeight: "600",
  },
  drillCardPlayers: {
    color: "#666",
    fontSize: 13,
  },
  drillActions: {
    flexDirection: "row",
    gap: 12,
  },
  editDrillBtn: {
    padding: 4,
  },
  deleteDrillBtn: {
    padding: 4,
  },
});

export default DrillCard;
