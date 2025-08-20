import React, { useState } from "react";
import { View, TextInput, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, StyleSheet, Alert, useColorScheme } from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import Feather from "react-native-vector-icons/Feather";
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: "#333",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#CA4B4B",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 15,
  },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    color: "#777",
    backgroundColor: "#fff",
  },
  iconButton: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#181818",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: "#fff",
    backgroundColor: "#222",
  },
  button: {
    backgroundColor: "#CA4B4B",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 15,
  },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 6,
    padding: 12,
    color: "#bbb",
    backgroundColor: "#222",
  },
  iconButton: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const handleLogin = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Password Reset", "A password reset email has been sent.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={isDark ? "#bbb" : "#777"}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Email Input"
            />

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={isDark ? "#bbb" : "#777"}
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                style={styles.inputWithIcon}
                accessibilityLabel="Password Input"
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSecureText(!secureText)}
              >
                <Feather name={secureText ? "eye" : "eye-off"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.button}
              accessibilityLabel="Login Button"
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={handleResetPassword}
                accessibilityLabel="Reset Password Button"
              >
                <Text style={[styles.link, { color: "#CA4B4B", marginRight: 18 }]}>Forgot password?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                accessibilityLabel="Sign Up Button"
              >
                <Text style={styles.link}>No account? Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
