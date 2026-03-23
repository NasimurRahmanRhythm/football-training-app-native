import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DurationSlider = ({ min, max, step, value, onChange }) => {
  const range = Array.from(
    { length: (max - min) / step + 1 },
    (_, i) => min + i * step,
  );
  const ITEM_WIDTH = 60;

  return (
    <View style={styles.sliderContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 150 }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
          if (range[index] !== undefined) {
            onChange(range[index]);
          }
        }}
      >
        {range.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.sliderItem, { width: ITEM_WIDTH }]}
            onPress={() => onChange(item)}
          >
            <View
              style={[
                styles.sliderLine,
                value === item && styles.sliderLineActive,
              ]}
            />
            <Text
              style={[
                styles.sliderValue,
                value === item && styles.sliderValueActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sliderIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 80,
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
    justifyContent: "center",
  },
  sliderItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sliderLine: {
    width: 2,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 1,
  },
  sliderLineActive: {
    backgroundColor: "#20E070",
    height: 30,
  },
  sliderValue: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  sliderValueActive: {
    color: "#fff",
    fontSize: 18,
  },
  sliderIndicator: {
    position: "absolute",
    left: "50%",
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: "#20E070",
    marginLeft: -1,
    opacity: 0.5,
  },
});

export default DurationSlider;
