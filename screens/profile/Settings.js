import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import { getAuth, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const Settings = ({ navigation }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const handleSave = async () => {
    try {
      if (fullName) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { fullName });
      }
      if (email && email !== user.email) {
        await updateEmail(user, email);
      }
      if (password) {
        await updatePassword(user, password);
      }
      Alert.alert("Success", "Profile updated.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

  const EditFieldModal = ({ visible, onClose, label, onSave, defaultValue, secureTextEntry = false }) => {
    const [value, setValue] = useState(defaultValue || '');

    const handleSave = () => {
        onSave(value);
        onClose();
    };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user);
              Alert.alert("Deleted", "Your account has been deleted.");
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } catch (error) {
              console.error(error);
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        onChangeText={setFullName}
        value={fullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#aaa"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#CA4B4B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    alignItems: "center",
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
  },
});
