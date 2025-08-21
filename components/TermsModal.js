import React, { useRef, useState } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform, Pressable, Linking } from "react-native";
import { LEGAL_CONFIG } from "../config/legal";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getAuth } from "firebase/auth";

const TermsModal = ({
  visible,
  onDone,
  locale,
  appVersion,
  TOS_VERSION,
  PRIVACY_VERSION,
}) => {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setScrolledToEnd(false);
      setAgreeTos(false);
      setReadPrivacy(false);
      setAnalyticsOptIn(false);
      setMarketingOptIn(false);
    }
  }, [visible]);

  const handleScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height -
      (layoutMeasurement.height + contentOffset.y);
    setScrolledToEnd(distanceFromBottom < LEGAL_CONFIG.MIN_SCROLL_PX_FROM_BOTTOM);
  };

  const canAccept = scrolledToEnd && agreeTos && readPrivacy;

  const handleAccept = async () => {
    if (!canAccept || saving) return;
    setSaving(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const userRef = doc(db, "users", user.uid);
      const consentPayload = {
        tosVersion: TOS_VERSION,
        privacyVersion: PRIVACY_VERSION,
        analyticsOptIn: analyticsOptIn,
        marketingOptIn: marketingOptIn,
        acceptedAt: serverTimestamp(),
        locale,
        appVersion,
      };

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, { consent: consentPayload });
      } else {
        await setDoc(userRef, { consent: consentPayload }, { merge: true });
      }

      setSaving(false);
      onDone(consentPayload); // Close modal and continue
    } catch (error) {
      setSaving(false);
      Alert.alert("Error", "Failed to save consent. Please check your connection and try again.");
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Required to use the app",
      "You must accept the Terms of Service and Privacy Policy to continue."
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {}}
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            Legal & Info — ToS v{TOS_VERSION} • Privacy v{PRIVACY_VERSION}
          </Text>
          <ScrollView
            style={styles.scroll}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            showsVerticalScrollIndicator={true}
            accessible
            accessibilityLabel="Terms and Privacy Scroll"
          >
            <Text style={styles.sectionTitle}>Terms of Service (Summary)</Text>
            <Text style={styles.sectionText}>
              By using LetzGrade, you agree to follow our rules, not misuse the app, and understand there is no warranty. See the full ToS for details.
            </Text>
            <Text style={styles.sectionTitle}>Privacy Policy (Summary)</Text>
            <Text style={styles.sectionText}>
              We collect your email and profile to provide the service. Data is stored securely in Firestore. You have rights to access, delete, or export your data.
            </Text>
            <Text style={styles.sectionText}>
              For full documents, visit our website or contact support.
            </Text>
            <View style={{ height: 80 }} /> {/* Spacer to ensure scroll gating */}
          </ScrollView>

          {/* Required checkboxes */}
          <View style={styles.checkboxRow}>
            <Pressable
              style={styles.checkboxTouch}
              onPress={() => setAgreeTos((v) => !v)}
              accessibilityLabel="Agree to Terms of Service"
            >
              <View style={[styles.checkbox, agreeTos && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>I agree to the Terms of Service</Text>
            </Pressable>
          </View>
          <View style={styles.checkboxRow}>
            <Pressable
              style={styles.checkboxTouch}
              onPress={() => setReadPrivacy((v) => !v)}
              accessibilityLabel="Read Privacy Policy"
            >
              <View style={[styles.checkbox, readPrivacy && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>I have read the Privacy Policy</Text>
            </Pressable>
          </View>

          {/* Optional toggles */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              Allow anonymous analytics & crash reports (optional)
            </Text>
            <Switch
              value={analyticsOptIn}
              onValueChange={setAnalyticsOptIn}
              accessibilityLabel="Analytics Opt-In"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              Receive updates & tips via email (optional)
            </Text>
            <Switch
              value={marketingOptIn}
              onValueChange={setMarketingOptIn}
              accessibilityLabel="Marketing Opt-In"
            />
          </View>

          {/* Navigation to full documents */}
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => Linking.openURL("https://letzgrade.com/tos")}>
              <Text style={styles.linkText}>Open full ToS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://letzgrade.com/privacy")}>
              <Text style={styles.linkText}>Open full Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                canAccept && !saving ? styles.buttonEnabled : styles.buttonDisabled,
              ]}
              onPress={handleAccept}
              disabled={!canAccept || saving}
              accessibilityLabel="Accept and Continue"
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Accept & Continue"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              accessibilityLabel="Cancel"
              disabled={saving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    color: "#CA4B4B",
  },
  scroll: {
    maxHeight: 220,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#222",
  },
  sectionText: {
    color: "#444",
    marginBottom: 8,
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxTouch: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CA4B4B",
    backgroundColor: "#fff",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#CA4B4B",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#222",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    minHeight: 44,
  },
  toggleLabel: {
    fontSize: 15,
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#CA4B4B",
    alignItems: "center",
  },
  buttonEnabled: {
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkRow: {
    marginTop: 12,
    marginBottom: 18,
  },
  linkText: {
    color: "#CA4B4B",
    textDecorationLine: "underline",
    fontSize: 15,
    marginBottom: 8,
  },
});