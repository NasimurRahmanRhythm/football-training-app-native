import AddPlayerModal from "@/components/add-player-modal";
import LoginModal from "@/components/login-modal";
import LoginScreen from "@/components/login-screen";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const { isLoggedIn, loading } = useAuth();

  const handleVerifySuccess = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#20E070" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLoginPress={() => setIsModalVisible(true)}
          onRegisterPress={() => setIsRegisterVisible(true)}
        />
        <LoginModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onVerifySuccess={handleVerifySuccess}
        />
        <AddPlayerModal
          visible={isRegisterVisible}
          onClose={() => setIsRegisterVisible(false)}
          isVerified={false}
        />
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="members" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({});
