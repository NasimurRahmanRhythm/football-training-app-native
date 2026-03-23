import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const CustomSlider = ({ min, max, step = 5, value, onChange }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  // Sync shared value with prop value when it changes externally
  useEffect(() => {
    if (trackWidth > 0) {
      const progress = (value - min) / (max - min);
      translateX.value = progress * trackWidth;
    }
  }, [value, trackWidth, min, max]);

  const updateValue = (x) => {
    "worklet";
    if (trackWidth === 0) return;

    const ratio = Math.min(Math.max(x / trackWidth, 0), 1);
    const rawValue = min + ratio * (max - min);
    const steppedValue = min + Math.round((rawValue - min) / step) * step;

    const finalValue = Math.min(Math.max(steppedValue, min), max);
    if (finalValue !== value) {
      runOnJS(onChange)(finalValue);
    }
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.4);
    })
    .onUpdate((event) => {
      const newX = Math.min(Math.max(event.x, 0), trackWidth);
      translateX.value = newX;
      updateValue(newX);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      // Snap to exact position after releasing
      const progress = (value - min) / (max - min);
      translateX.value = withTiming(progress * trackWidth);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const tapGesture = Gesture.Tap().onBegin((event) => {
    updateValue(event.x);
  });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - 12 }, { scale: scale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <View style={styles.container}>
      {/* Minus Button */}
      <TouchableOpacity
        style={styles.controlBtn}
        onPress={handleDecrement}
        activeOpacity={0.7}
      >
        <Ionicons name="remove-circle" size={28} color="#20E070" />
      </TouchableOpacity>

      {/* Slider */}
      <View style={styles.sliderWrapper}>
        <GestureDetector gesture={Gesture.Exclusive(gesture, tapGesture)}>
          <View
            style={styles.trackContainer}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.track}>
              <Animated.View style={[styles.progress, animatedProgressStyle]} />
              <Animated.View style={[styles.thumb, animatedThumbStyle]} />
            </View>
          </View>
        </GestureDetector>

        {/* Labels */}
        <View style={styles.labelsRow}>
          <Text style={styles.limitLabel}>{min}</Text>
          <Text style={styles.currentValue}>{value} mins</Text>
          <Text style={styles.limitLabel}>{max}</Text>
        </View>
      </View>

      {/* Plus Button */}
      <TouchableOpacity
        style={styles.controlBtn}
        onPress={handleIncrement}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={28} color="#20E070" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222",
    marginVertical: 10,
  },
  controlBtn: {
    height: 48, 
    justifyContent: "center",
    alignItems: "center",
  },
  sliderWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  trackContainer: {
    height: 48,
    justifyContent: "center",
  },
  track: {
    height: 8,
    backgroundColor: "#222",
    borderRadius: 4,
    position: "relative",
  },
  progress: {
    height: "100%",
    backgroundColor: "#20E070",
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#20E070",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  limitLabel: {
    color: "#444",
    fontSize: 12,
    fontWeight: "700",
  },
  currentValue: {
    color: "#20E070",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});

export default CustomSlider;
