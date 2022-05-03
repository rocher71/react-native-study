import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { color } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>sdkfjakfjsalfjl</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "black",
  },
});
