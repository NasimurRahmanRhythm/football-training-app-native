import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SessionDateSection = ({
  sessionDate,
  showDatePicker,
  onPress,
  onDateChange,
}) => {
  return (
    <View style={styles.dateSection}>
      <Text style={styles.sectionLabel}>Session Date</Text>
      <TouchableOpacity
        style={styles.dateInputContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.dateInputContent}>
          <Ionicons name="calendar-outline" size={20} color="#20E070" />
          <Text style={styles.dateInputText}>
            {sessionDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#444" />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={sessionDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInputText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default SessionDateSection;
