import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * LoginButton
 * A stylish login button that opens the login modal.
 * Props:
 *   onPress         — called when the Login button is tapped
 *   onRegisterPress — called when the Register a Player button is tapped
 */
const LoginButton = ({ onPress, onRegisterPress }) => {
  return (
    <View style={styles.wrapper}>
      {/* Primary: Login */}
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={onPress}
      >
        <LinearGradient
          colors={["#20E070", "#0DBF58"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.label}>Login</Text>
        </LinearGradient>
      </Pressable>

      {/* Secondary: Register a Player */}
      <Pressable
        style={({ pressed }) => [
          styles.registerBtn,
          pressed && styles.btnPressed,
        ]}
        onPress={onRegisterPress}
      >
        <Text style={styles.registerLabel}>Register a Player</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 12,
  },
  btn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#20E070",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  label: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  registerBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    paddingHorizontal: 28,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  registerLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});

export default LoginButton;
