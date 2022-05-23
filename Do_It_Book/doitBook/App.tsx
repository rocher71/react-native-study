import React from "react";
import { Text, SafeAreaView } from "react-native";

export default function App() {
  const children = [
    <Text>Hello world!</Text>,
    <Text>Hello world!</Text>,
    <Text>Hello world!</Text>,
  ];
  return <SafeAreaView>{children}</SafeAreaView>;
}
