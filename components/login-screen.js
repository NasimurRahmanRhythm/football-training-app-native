import ImageSlider from "@/components/image-slider";
import { SLIDE_DATA } from "@/constants/slideData";
import { StyleSheet, View } from "react-native";

export default function LoginScreen({ onLoginPress, onRegisterPress }) {
  return (
    <View style={styles.container}>
      <ImageSlider
        data={SLIDE_DATA}
        onLoginPress={onLoginPress}
        onRegisterPress={onRegisterPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
