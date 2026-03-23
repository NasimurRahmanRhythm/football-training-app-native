import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#0a0a0a",
      card: "#0a0a0a", // Added
      border: "#121212", // Added
      notification: "#20E070", // Added
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
          <ThemeProvider value={customDarkTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: "#0a0a0a" },
                headerShown: false, // Added
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="player/[id]" />
              <Stack.Screen name="session/[id]" />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </View>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
