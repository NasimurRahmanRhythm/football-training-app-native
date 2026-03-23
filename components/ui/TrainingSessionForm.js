import CustomSlider from "@/components/CustomSlider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DrillCard from "./DrillCard";
import PlayerCard from "./PlayerCard";

const TrainingSessionForm = ({
  drills,
  currentDrillName,
  editingDrillId,
  onShowDrillModal,
  onResetCurrentDrill,
  currentDrillDuration,
  setCurrentDrillDuration,
  selectedPlayers,
  onShowPlayerModal,
  onGiveEval,
  isDrillValid,
  onFinishDrill,
  onEditDrill,
  onDeleteDrill,
}) => {
  return (
    <View style={styles.formSection}>
      {/* Previous Drills List */}
      {drills.length > 0 && (
        <View style={styles.addedDrillsList}>
          <Text style={styles.sectionLabel}>
            Added Drills ({drills.length})
          </Text>
          {drills.map((d, index) => (
            <DrillCard
              key={d.id || `drill-${index}`}
              drill={d}
              index={index}
              onEdit={() => onEditDrill(d)}
              onDelete={() => onDeleteDrill(d.id)}
            />
          ))}
        </View>
      )}

      {/* Current Drill Config */}
      <View style={styles.currentDrillBox}>
        <Text style={styles.sectionLabel}>
          {currentDrillName
            ? editingDrillId
              ? `Editing: ${currentDrillName}`
              : `Configuring: ${currentDrillName}`
            : "Add a Drill"}
        </Text>

        {!currentDrillName ? (
          <TouchableOpacity
            style={styles.selectDrillBtn}
            onPress={onShowDrillModal}
          >
            <Ionicons name="list" size={20} color="#20E070" />
            <Text style={styles.selectDrillBtnText}>Select a Drill</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.drillConfigRow}>
              <Text style={styles.drillConfigTitle}>{currentDrillName}</Text>
              <TouchableOpacity
                onPress={onResetCurrentDrill}
                style={styles.deleteDrillBtnMini}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4444" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              Duration: {currentDrillDuration} mins
            </Text>
            <CustomSlider
              min={5}
              max={60}
              step={5}
              value={currentDrillDuration}
              onChange={setCurrentDrillDuration}
            />

            <View style={styles.playersSection}>
              <View style={styles.playersHeader}>
                <Text style={styles.sectionLabel}>Players for this drill</Text>
              </View>

              {selectedPlayers.length === 0 ? (
                <TouchableOpacity
                  style={styles.addPlayerBtn}
                  onPress={onShowPlayerModal}
                >
                  <Ionicons name="person-add" size={20} color="#20E070" />
                  <Text style={styles.addPlayerBtnText}>Select Players</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.selectedPlayersList}>
                  {selectedPlayers.map((p, index) => (
                    <PlayerCard
                      key={p._id || `drill-player-${index}`}
                      player={p}
                      onEvalPress={() => onGiveEval(p)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addMorePlayersSmall}
                    onPress={onShowPlayerModal}
                  >
                    <Text style={styles.addMoreLink}>+ Add more players</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.finishDrillBtn, !isDrillValid && { opacity: 0.5 }]}
              onPress={onFinishDrill}
              disabled={!isDrillValid}
            >
              <Text style={styles.finishDrillBtnText}>
                {editingDrillId ? "Update Drill" : "Finish this Drill"}
              </Text>
            </TouchableOpacity>
          </>
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
  addedDrillsList: {
    marginBottom: 24,
    gap: 12,
  },
  currentDrillBox: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
    borderStyle: "dashed",
  },
  selectDrillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  selectDrillBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  drillConfigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  drillConfigTitle: {
    color: "#20E070",
    fontSize: 20,
    fontWeight: "800",
  },
  deleteDrillBtnMini: {
    padding: 4,
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
  addMoreLink: {
    color: "#20E070",
    fontSize: 14,
    fontWeight: "600",
  },
  addMorePlayersSmall: {
    alignItems: "center",
    paddingVertical: 10,
  },
  finishDrillBtn: {
    backgroundColor: "#222",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  finishDrillBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default TrainingSessionForm;
