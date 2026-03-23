import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DrillSelectionModal = ({ visible, onClose, onSelect }) => {
  const [drillOptions, setDrillOptions] = useState([
    "Warmup",
    "Shooting",
    "Passing",
    "Tactical",
    "Fitness",
  ]);
  const [newDrill, setNewDrill] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newDrill.trim()) {
      setDrillOptions([...drillOptions, newDrill.trim()]);
      onSelect(newDrill.trim());
      setNewDrill("");
      setIsAdding(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: "70%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Drill</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {!isAdding ? (
            <>
              <FlatList
                data={drillOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.drillItem}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <Text style={styles.drillItemText}>{item}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#333" />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.addNewDrillBtn}
                onPress={() => setIsAdding(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#20E070" />
                <Text style={styles.addNewDrillBtnText}>Add New Drill</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.addNewDrillContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter drill name"
                placeholderTextColor="#666"
                value={newDrill}
                onChangeText={setNewDrill}
                autoFocus
              />
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.modalHalfBtn, { backgroundColor: "#222" }]}
                  onPress={() => setIsAdding(false)}
                >
                  <Text style={[styles.modalHalfBtnText, { color: "#fff" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalHalfBtn, { backgroundColor: "#20E070" }]}
                  onPress={handleAdd}
                >
                  <Text style={styles.modalHalfBtnText}>Add & Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
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
  drillItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  drillItemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  addNewDrillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    marginTop: 10,
  },
  addNewDrillBtnText: {
    color: "#20E070",
    fontSize: 15,
    fontWeight: "600",
  },
  addNewDrillContainer: {
    paddingTop: 10,
    gap: 20,
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
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalHalfBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  modalHalfBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default DrillSelectionModal;
