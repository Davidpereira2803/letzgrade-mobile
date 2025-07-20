import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { auth, logout, db } from "../../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchFullName = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFullName(docSnap.data().fullName);
      }
    };

    fetchFullName();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>Hi {fullName || "User"}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#CA4B4B",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
