import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { auth, logout, db } from "../../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, Timestamp, } from "firebase/firestore";
import { format } from "date-fns";

const Profile = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const fetchFullName = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName);

        if (data.createdAt instanceof Timestamp) {
          setCreatedAt(data.createdAt.toDate());
        }
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
      <View style={styles.topSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName ? fullName[0].toUpperCase() : "U"}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>Hi {fullName || "User"}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Account Info</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.profileText}>
            Joined on: {createdAt ? format(createdAt, 'dd MMM yyyy') : 'Unknown'}
          </Text>
        </View>
      </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  topSection: {
    alignItems: 'center',
    width: '100%',
  },

  infoContainer: {
    marginTop: 20,
    width: '100%',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  logoutButton: {
    backgroundColor: "#CA4B4B",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
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
    alignSelf: 'center',
    marginBottom: 60,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CA4B4B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  joinDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});
