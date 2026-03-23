import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

const PlayerSelectionModal = ({ visible, onClose, onAdd, alreadySelected }) => {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPlayers();
      // Ensure all IDs are strings and handle potential id/_id variation
      setSelectedIds(
        alreadySelected.map((p) => String(p._id || p.id || "")).filter(Boolean),
      );
    }
  }, [visible, alreadySelected]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user?userType=PLAYER`);
      const data = await response.json();
      if (response.ok && data.success) {
        setPlayers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelect = (id) => {
    const stringId = String(id);
    setSelectedIds((prev) =>
      prev.includes(stringId)
        ? prev.filter((i) => i !== stringId)
        : [...prev, stringId],
    );
  };

  const handleAdd = () => {
    const selected = selectedIds
      .map((id) => {
        // First check in current fetched players
        const fromCurrent = players.find((p) => String(p._id) === id);
        if (fromCurrent) return fromCurrent;
        // If not in current (e.g., filtered out by search), look in alreadySelected
        return alreadySelected.find((p) => String(p._id) === id);
      })
      .filter(Boolean); // Filter out any nulls just in case

    onAdd(selected);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Players</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search players..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#20E070"
              style={{ margin: 40 }}
            />
          ) : (
            <FlatList
              data={filteredPlayers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playerSelectionItem}
                  onPress={() => toggleSelect(item._id)}
                >
                  <View>
                    <Text style={styles.playerName}>{item.name}</Text>
                    <Text style={styles.playerPos}>
                      {item?.personalInfo?.position || item?.position || "N/A"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedIds.includes(String(item._id || item.id)) &&
                        styles.checkboxActive,
                    ]}
                  >
                    {selectedIds.includes(String(item._id || item.id)) && (
                      <Ionicons name="checkmark" size={16} color="#000" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No players found</Text>
              }
            />
          )}

          <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd}>
            <Text style={styles.modalAddBtnText}>
              Add Players ({selectedIds.length})
            </Text>
          </TouchableOpacity>
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
    height: "85%",
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
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  modalSearchInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  playerSelectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  playerName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  playerPos: {
    color: "#666",
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#20E070",
    borderColor: "#20E070",
  },
  modalAddBtn: {
    backgroundColor: "#20E070",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  modalAddBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});

export default PlayerSelectionModal;
