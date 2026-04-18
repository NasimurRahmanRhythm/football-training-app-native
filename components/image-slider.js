import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LoginButton from "./login-button";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const SLIDE_INTERVAL = 5000;

const ImageSlider = ({ data = [], onLoginPress, onRegisterPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const timerRef = useRef(null);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);

  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        const next = (currentIndexRef.current + 1) % data.length;
        scrollViewRef.current?.scrollTo({
          x: next * SCREEN_WIDTH,
          animated: true,
        });
        currentIndexRef.current = next;
        setCurrentIndex(next);
      }
    }, SLIDE_INTERVAL);
  }, [data.length]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, startAutoSlide]);

  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    currentIndexRef.current = index;
    setCurrentIndex(index);
    startAutoSlide();
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTouchEnd = () => {
    isPausedRef.current = false;
    startAutoSlide();
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No slides available</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Scrollable images */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        showsHorizontalScrollIndicator={false}
        style={StyleSheet.absoluteFill}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.slideContainer}>
            <Image
              source={item.image}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.28)", "rgba(0,0,0,0.82)"]}
              locations={[0.35, 0.65, 1]}
              style={styles.gradient}
            />
          </View>
        ))}
      </ScrollView>

      {/* Text overlay */}
      <View style={styles.textOverlay} pointerEvents="none">
        <Text style={styles.title}>{data[currentIndex]?.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          {data[currentIndex]?.description}
        </Text>
      </View>

      {/* Login button */}
      <View style={styles.buttonWrapper} pointerEvents="box-none">
        <LoginButton onPress={onLoginPress} onRegisterPress={onRegisterPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Slide text ──────────────────────────────────────────────────────────────
  textOverlay: {
    position: "absolute",
    bottom: 250,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    zIndex: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    lineHeight: 42,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  divider: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#20E070",
    marginVertical: 14,
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
  },

  buttonWrapper: {
    position: "absolute",
    bottom: 80,
    left: 24,
    right: 24,
    zIndex: 20,
    marginBottom: 12,
  },
});

export default ImageSlider;
