import {
  Animated,
  Easing,
  StyleSheet,
  View
} from "react-native";

import {
  useEffect,
  useRef,
} from "react";

import {
  colors,
  fonts,
} from "../theme";

type Props = {
  onFinished: () => void;
};

export default function AnimatedSoulPathLaunch({
  onFinished,
}: Props) {
  const containerOpacity =
    useRef(
      new Animated.Value(1)
    ).current;

  const markOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const markScale =
    useRef(
      new Animated.Value(0.88)
    ).current;

  const markTranslateY =
    useRef(
      new Animated.Value(12)
    ).current;

  const titleOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const titleTranslateY =
    useRef(
      new Animated.Value(8)
    ).current;

  const taglineOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  useEffect(() => {
    const animation =
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            markOpacity,
            {
              toValue: 1,
              duration: 420,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver:
                true,
            }
          ),

          Animated.spring(
            markScale,
            {
              toValue: 1,
              friction: 7,
              tension: 42,
              useNativeDriver:
                true,
            }
          ),

          Animated.timing(
            markTranslateY,
            {
              toValue: 0,
              duration: 520,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver:
                true,
            }
          ),
        ]),

        Animated.parallel([
          Animated.timing(
            titleOpacity,
            {
              toValue: 1,
              duration: 320,
              useNativeDriver:
                true,
            }
          ),

          Animated.timing(
            titleTranslateY,
            {
              toValue: 0,
              duration: 360,
              easing:
                Easing.out(
                  Easing.cubic
                ),
              useNativeDriver:
                true,
            }
          ),
        ]),

        Animated.timing(
          taglineOpacity,
          {
            toValue: 1,
            duration: 280,
            useNativeDriver:
              true,
          }
        ),

        Animated.delay(350),

        Animated.timing(
          containerOpacity,
          {
            toValue: 0,
            duration: 320,
            easing:
              Easing.inOut(
                Easing.cubic
              ),
            useNativeDriver:
              true,
          }
        ),
      ]);

    animation.start(
      ({ finished }) => {
        if (finished) {
          onFinished();
        }
      }
    );

    return () => {
      animation.stop();
    };
  }, [
    containerOpacity,
    markOpacity,
    markScale,
    markTranslateY,
    onFinished,
    taglineOpacity,
    titleOpacity,
    titleTranslateY,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity:
            containerOpacity,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="auto"
    >
      <View style={styles.center}>
        <Animated.Image
          source={require("../../assets/splash-icon.png")}
          resizeMode="contain"
          style={[
            styles.mark,
            {
              opacity:
                markOpacity,
              transform: [
                {
                  translateY:
                    markTranslateY,
                },
                {
                  scale:
                    markScale,
                },
              ],
            },
          ]}
        />

        <Animated.Text
          style={[
            styles.title,
            {
              opacity:
                titleOpacity,
              transform: [
                {
                  translateY:
                    titleTranslateY,
                },
              ],
            },
          ]}
        >
          SoulPath
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity:
                taglineOpacity,
            },
          ]}
        >
          A private space for the journey within.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      zIndex: 9999,
      elevation: 9999,
      backgroundColor:
        colors.background,
      alignItems: "center",
      justifyContent:
        "center",
    },

    center: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 32,
    },

    mark: {
      width: 220,
      height: 220,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 44,
      lineHeight: 50,
      marginTop: 8,
    },

    tagline: {
      color:
        colors.goldSoft,
      fontFamily:
        fonts.displayItalic,
      fontSize: 16,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 290,
      marginTop: 4,
    },
  });
