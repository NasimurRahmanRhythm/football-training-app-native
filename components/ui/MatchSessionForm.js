import CustomSlider from "@/components/CustomSlider";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PlayerCard from "./PlayerCard";

const MatchSessionForm = ({
  matchDuration,
  setMatchDuration,
  opponent,
  setOpponent,
  selectedPlayers,
  onAddMorePlayers,
  onGiveEval,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionLabel}>
        Match Duration: {matchDuration} mins
      </Text>
      <CustomSlider
        min={10}
        max={90}
        step={5}
        value={matchDuration}
        onChange={setMatchDuration}
      />

      <Text style={styles.sectionLabel}>Opponent Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter team name"
        placeholderTextColor="#666"
        value={opponent}
        onChangeText={setOpponent}
      />

      <View style={styles.playersSection}>
        <View style={styles.playersHeader}>
          <Text style={styles.sectionLabel}>Players</Text>
          {selectedPlayers.length > 0 && (
            <TouchableOpacity onPress={onAddMorePlayers}>
              <Text style={styles.addMoreLink}>+ Add more</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedPlayers.length === 0 ? (
          <TouchableOpacity
            style={styles.addPlayerBtn}
            onPress={onAddMorePlayers}
          >
            <Ionicons name="person-add" size={20} color="#20E070" />
            <Text style={styles.addPlayerBtnText}>Add Players</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedPlayersList}>
            {selectedPlayers.map((p, index) => (
              <PlayerCard
                key={p._id || `match-player-${index}`}
                player={p}
                onEvalPress={() => onGiveEval(p)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    gap: 16,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  playersSection: {
    marginTop: 8,
  },
  playersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addMoreLink: {
    color: "#20E070",
    fontSize: 14,
    fontWeight: "600",
  },
  addPlayerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32, 224, 112, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(32, 224, 112, 0.2)",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  addPlayerBtnText: {
    color: "#20E070",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedPlayersList: {
    gap: 12,
  },
});

export default MatchSessionForm;
