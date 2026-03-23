import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SessionTypeTabs = ({ sessionType, onTabSwitch }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, sessionType === "MATCH" && styles.activeTab]}
        onPress={() => onTabSwitch("MATCH")}
      >
        <Ionicons
          name="trophy"
          size={20}
          color={sessionType === "MATCH" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.tabText,
            sessionType === "MATCH" && styles.activeTabText,
          ]}
        >
          Match
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          sessionType === "TRAINING" && styles.activeTab,
        ]}
        onPress={() => onTabSwitch("TRAINING")}
      >
        <Ionicons
          name="fitness"
          size={20}
          color={sessionType === "TRAINING" ? "#fff" : "#666"}
        />
        <Text
          style={[
            styles.tabText,
            sessionType === "TRAINING" && styles.activeTabText,
          ]}
        >
          Training
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#222",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#2b2b2b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
});

export default SessionTypeTabs;
