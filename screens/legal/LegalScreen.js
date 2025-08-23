import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, Alert, ActivityIndicator } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { LEGAL_CONFIG } from "../../config/legal";
import { useTheme } from "../../context/ThemeContext";

const TOS_URL = "https://davidpereira2803.github.io/letzgrade.web/#terms";
const PRIVACY_URL = "https://davidpereira2803.github.io/letzgrade.web/#policy";

const LegalScreen = () => {
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  useEffect(() => {
    const fetchConsent = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in");
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        setConsent(data.consent || {});
      } catch (err) {
        Alert.alert("Error", "Could not load consent info.");
      }
      setLoading(false);
    };
    fetchConsent();
  }, []);

  const updateConsent = async (field, value) => {
    if (!consent) return;
    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not signed in");
      const userRef = doc(db, "users", user.uid);
      const newConsent = { ...consent, [field]: value };
      await updateDoc(userRef, { consent: newConsent });
      setConsent(newConsent);
    } catch (err) {
      Alert.alert("Error", "Could not update consent.");
    }
    setSaving(false);
  };

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open link.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#CA4B4B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Legal & Privacy</Text>
      <Text style={styles.version}>
        ToS v{LEGAL_CONFIG.TOS_VERSION} • Privacy v{LEGAL_CONFIG.PRIVACY_VERSION}
      </Text>
      <Text style={styles.effective}>Effective: Jan 2024</Text>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => openLink(TOS_URL)}
        accessibilityLabel="Open Terms of Service"
      >
        <Text style={styles.linkText}>View Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => openLink(PRIVACY_URL)}
        accessibilityLabel="Open Privacy Policy"
      >
        <Text style={styles.linkText}>View Privacy Policy</Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          Allow anonymous analytics & crash reports
        </Text>
        <Switch
          value={!!consent?.analyticsOptIn}
          onValueChange={(val) => updateConsent("analyticsOptIn", val)}
          disabled={saving}
          accessibilityLabel="Analytics Opt-In"
          thumbColor={isDark ? "#CA4B4B" : "#ccc"}
          trackColor={{ false: "#bbb", true: "#CA4B4B" }}
        />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          Receive updates & tips via email
        </Text>
        <Switch
          value={!!consent?.marketingOptIn}
          onValueChange={(val) => updateConsent("marketingOptIn", val)}
          disabled={saving}
          accessibilityLabel="Marketing Opt-In"
          thumbColor={isDark ? "#CA4B4B" : "#ccc"}
          trackColor={{ false: "#bbb", true: "#CA4B4B" }}
        />
      </View>
    </View>
  );
};

export default LegalScreen;

const lightStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#CA4B4B" },
  version: { fontSize: 16, marginBottom: 2, color: "#222" },
  effective: { fontSize: 14, marginBottom: 18, color: "#888" },
  linkButton: { marginBottom: 12, paddingVertical: 8 },
  linkText: { color: "#CA4B4B", fontWeight: "bold", fontSize: 16 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    minHeight: 44,
  },
  toggleLabel: { fontSize: 15, color: "#222", flex: 1, marginRight: 8 },
});

const darkStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#181818" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#CA4B4B" },
  version: { fontSize: 16, marginBottom: 2, color: "#fff" },
  effective: { fontSize: 14, marginBottom: 18, color: "#bbb" },
  linkButton: { marginBottom: 12, paddingVertical: 8 },
  linkText: { color: "#CA4B4B", fontWeight: "bold", fontSize: 16 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    minHeight: 44,
  },
  toggleLabel: { fontSize: 15, color: "#fff", flex: 1, marginRight: 8 },
});