import {
  useNavigation,
  usePreventRemove,
} from "expo-router/react-navigation";

import {
  Alert,
  Platform,
} from "react-native";

type Options = {
  title?: string;
  message?: string;
};

export function useUnsavedChangesGuard(
  hasUnsavedChanges: boolean,
  options: Options = {}
) {
  const navigation =
    useNavigation();

  const title =
    options.title ??
    "Leave without saving?";

  const message =
    options.message ??
    "You have changes that haven't been saved yet.";

  usePreventRemove(
    hasUnsavedChanges,
    ({ data }) => {
      if (
        Platform.OS === "web"
      ) {
        const shouldLeave =
          typeof window !==
            "undefined" &&
          window.confirm(
            `${title}\n\n${message}`
          );

        if (shouldLeave) {
          navigation.dispatch(
            data.action
          );
        }

        return;
      }

      Alert.alert(
        title,
        message,
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Leave",
            style: "destructive",

            onPress: () =>
              navigation.dispatch(
                data.action
              ),
          },
        ]
      );
    }
  );
} 