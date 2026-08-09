import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#D9C6FF",
        tabBarInactiveTintColor: "#71677F",

        tabBarStyle: {
          backgroundColor: "#121020",
          borderTopColor: "#2B2440",
          borderTopWidth: 1,
          height: 72,
          paddingTop: 7,
          paddingBottom: 9,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarHideOnKeyboard: true,

        sceneStyle: {
          backgroundColor: "#0C0A18",
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",

          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="home"
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

          tabBarIcon: ({ color, size }) => (
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
          title: "Experiences",

          tabBarIcon: ({ color, size }) => (
            <FontAwesome
              name="moon-o"
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

          tabBarIcon: ({ color, size }) => (
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

          tabBarIcon: ({ color, size }) => (
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