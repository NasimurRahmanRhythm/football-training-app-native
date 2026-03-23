import { API_BASE_URL } from "@/constants/ApplicationConstants";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionsScreen() {
  const router = useRouter();
  const [filterType, setFilterType] = useState("MATCH"); // 'MATCH' or 'TRAINING'
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sessions?type=${type}`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data);
      } else {
        console.error("Failed to fetch sessions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions(filterType);
    }, [filterType]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions(filterType);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => {
        router.push(`/session/${item._id}`);
      }}
    >
      <View style={styles.sessionInfo}>
        <Ionicons
          name={filterType === "MATCH" ? "trophy-outline" : "fitness-outline"}
          size={20}
          color="#20E070"
          style={styles.sessionIcon}
        />
        <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#121212", "#0a0a0a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#20E070" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Sessions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, filterType === "MATCH" && styles.activeTab]}
          onPress={() => setFilterType("MATCH")}
        >
          <Text
            style={[
              styles.tabText,
              filterType === "MATCH" && styles.activeTabText,
            ]}
          >
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            filterType === "TRAINING" && styles.activeTab,
          ]}
          onPress={() => setFilterType("TRAINING")}
        >
          <Text
            style={[
              styles.tabText,
              filterType === "TRAINING" && styles.activeTabText,
            ]}
          >
            Training
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#20E070" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item._id || item.date}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#222" />
              <Text style={styles.emptyText}>No sessions found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#222",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#222",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#20E070",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  sessionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionIcon: {
    marginRight: 12,
  },
  sessionDate: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#444",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "600",
  },
});
