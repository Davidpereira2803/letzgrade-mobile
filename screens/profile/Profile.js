import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { auth, logout, db } from "../../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, Timestamp, } from "firebase/firestore";
import { format } from "date-fns";
import LottieView from "lottie-react-native";
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  topSection: { alignItems: 'center', width: '100%' },
  infoContainer: { marginTop: 20, width: '100%' },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  logoutButton: {
    backgroundColor: "#CA4B4B",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#222" },
  email: { fontSize: 16, color: "#666" },
  verification: { fontSize: 16, marginLeft: 10, marginBottom: 0 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  avatarContainer: { marginBottom: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#CA4B4B", justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  joinDate: { fontSize: 14, color: "#888", marginTop: 4 },
  emailRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8, width: '100%',
  },
  verificationRow: { flexDirection: 'row', alignItems: 'center' },
  verificationAnimation: { width: 32, height: 32, marginLeft: 6 },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#181818',
  },
  topSection: { alignItems: 'center', width: '100%' },
  infoContainer: { marginTop: 20, width: '100%' },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: "#fff" },
  logoutButton: {
    backgroundColor: "#CA4B4B",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  email: { fontSize: 16, color: "#bbb" },
  verification: { fontSize: 16, marginLeft: 10, marginBottom: 0 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  avatarContainer: { marginBottom: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#CA4B4B", justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  joinDate: { fontSize: 14, color: "#bbb", marginTop: 4 },
  emailRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8, width: '100%',
  },
  verificationRow: { flexDirection: 'row', alignItems: 'center' },
  verificationAnimation: { width: 32, height: 32, marginLeft: 6 },
});

const Profile = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;
  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const fetchFullName = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName);

          if (data.createdAt instanceof Timestamp) {
            setCreatedAt(data.createdAt.toDate());
          }
        } else {
          Alert.alert("Profile Error", "User data not found.");
        }
      } catch (error) {
        Alert.alert("Profile Error", error.message);
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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>No user logged in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText} accessibilityLabel={`Avatar for ${fullName || "User"}`}>
              {fullName ? fullName[0].toUpperCase() : "U"}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>Hi {fullName || "User"}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Account Info</Text>
          <View style={styles.emailRow}>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.verificationRow}>
              <Text
                style={[
                  styles.verification,
                  { color: user?.emailVerified ? "#43a047" : "#CA4B4B" }
                ]}
              >
                {user?.emailVerified ? "Verified" : "Not Verified"}
              </Text>
              <LottieView
                source={
                  user?.emailVerified
                    ? require("../../assets/animations/check.json")
                    : require("../../assets/animations/error.json")
                }
                autoPlay
                loop
                style={styles.verificationAnimation}
              />
            </View>
          </View>
          <Text style={styles.joinDate}>
            Joined on: {createdAt ? format(createdAt, 'dd MMM yyyy') : 'Unknown'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Logout Button"
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
