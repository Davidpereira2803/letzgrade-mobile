import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert, StyleSheet, useColorScheme } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#222' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 15, color: '#333', backgroundColor: '#fff' },
  button: { backgroundColor: '#CA4B4B', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#333', fontWeight: 'bold' },
  inputContainer: { position: "relative", justifyContent: "center", marginBottom: 15 },
  inputWithIcon: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 12, color: "#777", backgroundColor: "#fff" },
  iconButton: { position: "absolute", right: 10, height: "100%", justifyContent: "center", alignItems: "center" },
});

const darkStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#181818' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#fff' },
  input: { borderWidth: 1, borderColor: '#444', borderRadius: 6, padding: 12, marginBottom: 15, color: '#fff', backgroundColor: '#222' },
  button: { backgroundColor: '#CA4B4B', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  inputContainer: { position: "relative", justifyContent: "center", marginBottom: 15 },
  inputWithIcon: { borderWidth: 1, borderColor: "#444", borderRadius: 6, padding: 12, color: "#bbb", backgroundColor: "#222" },
  iconButton: { position: "absolute", right: 10, height: "100%", justifyContent: "center", alignItems: "center" },
});

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const handleSignup = async () => {
    Keyboard.dismiss();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 8 characters long, contain a lowercase letter, and a non-alphanumeric character'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const { uid } = userCredential.user;
      
      await updateProfile(userCredential.user, {
        displayName: trimmedFullName,
      });

      await setDoc(doc(db, 'users', uid), {
        fullName: trimmedFullName,
        email: trimmedEmail,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Account created! Verify your email!');
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={isDark ? "#bbb" : "#777"}
              value={fullName}
              onChangeText={setFullName}
              accessibilityLabel='Full Name Input'
            />
            <TextInput style={styles.input}
              placeholder="Email"
              placeholderTextColor={isDark ? "#bbb" : "#777"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel='Email Input'
            />

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={isDark ? "#bbb" : "#777"}
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                style={styles.inputWithIcon}
                accessibilityLabel='Password Input'
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSecureText(!secureText)}
              >
                <Feather name={secureText ? "eye" : "eye-off"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={isDark ? "#bbb" : "#777"}
                secureTextEntry={secureConfirmText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.inputWithIcon}
                accessibilityLabel='Confirm Password Input'
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSecureConfirmText(!secureConfirmText)}
              >
                <Feather name={secureConfirmText ? "eye" : "eye-off"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              style={styles.button}
              accessibilityLabel='Sign Up Button'
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityLabel='Login Button'
            >
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;
