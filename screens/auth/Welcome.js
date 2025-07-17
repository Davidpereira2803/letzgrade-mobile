import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const Welcome = ({ navigation }) => {
  const animationRef = useRef(null);
  
  return (
    <View style={styles.container}>
      <LottieView
          ref={animationRef}
          source={require("../../assets/animations/book-loading.json")}
          autoPlay
          loop
          style={styles.animation}
      />

      <Text style={styles.title}>Welcome to LetzGrade</Text>
      <Text style={styles.subtitle}>Track your grades, effortlessly.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  button: {
    backgroundColor: "#CA4B4B",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    width: "100%",
  },
  secondaryButton: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  animation: {
  width: 300,
  height: 300,
  marginBottom: 20,
  },
});
