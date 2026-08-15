import {
  FontAwesome,
} from "@expo/vector-icons";

import {
  Tabs,
} from "expo-router";

import {
  colors,
  fonts,
} from "../../src/theme";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TabLayout() {
  const insets =
    useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard:
          true,

        tabBarActiveTintColor:
          colors.lavender,

        tabBarInactiveTintColor:
          colors.textDim,

        tabBarStyle: {
          backgroundColor:
            "#121020",

          borderTopColor:
            colors.border,

          borderTopWidth: 1,

          height:
            64 +
            insets.bottom,

          paddingTop: 7,

          paddingBottom:
            Math.max(
              insets.bottom,
              8
            ),
        },

        tabBarLabelStyle: {
          fontFamily:
            fonts.bodySemiBold,

          fontSize: 10,
        },

        sceneStyle: {
          backgroundColor:
            colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <FontAwesome
              name="moon-o"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <FontAwesome
              name="book"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="experiences"
        options={{
          title:
            "Dreams & Signs",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <FontAwesome
              name="star-o"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <FontAwesome
              name="line-chart"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <FontAwesome
              name="cog"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
} 