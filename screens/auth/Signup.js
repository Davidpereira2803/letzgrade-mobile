// screens/auth/Signup.js
import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureConfirmText, setSecureConfirmText] = useState(true);


  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      await setDoc(doc(db, 'users', uid), {
        fullName,
        email,
      });

      Alert.alert('Success', 'Account created!');
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
              placeholderTextColor="#777"
              value={fullName}
              onChangeText={setFullName}
              />
            <TextInput style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#777"
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" />

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                style={styles.inputWithIcon}
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
                placeholderTextColor="#777"
                secureTextEntry={secureConfirmText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.inputWithIcon}
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSecureConfirmText(!secureConfirmText)}
              >
                <Feather name={secureConfirmText ? "eye" : "eye-off"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSignup} style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center'
 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    padding: 12, 
    marginBottom: 15, 
    color: '#333'
  },
  button: { 
    backgroundColor: '#CA4B4B', 
    padding: 15, 
    borderRadius: 5 
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  link: { 
    marginTop: 20, 
    textAlign: 'center', 
    color: '#333',
    fontWeight: 'bold' 
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
  },
  iconButton: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
