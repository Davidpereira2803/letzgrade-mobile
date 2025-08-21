import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { auth, db } from '../../services/firebase';
import { updateProfile, updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import EditFieldModal from '../../components/EditFieldModal';
import ReauthModal from '../../components/ReauthModal';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const navigation = useNavigation();
  const { theme, setAppTheme, isDark } = useTheme();
  const user = auth.currentUser;
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isReauthVisible, setReauthVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = isDark ? darkStyles : lightStyles;

  const handleUpdateName = async (newName) => {
    setLoading(true);
    try {
      await updateProfile(user, { displayName: newName });
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { fullName: newName });
      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (newEmail) => {
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim();

    if (!emailRegex.test(trimmedEmail)) {
      setLoading(false);
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      await updateEmail(user, newEmail);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { email: newEmail });
      Alert.alert('Success', 'Email updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    setLoading(true);

    const passwordRegex = /^(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setLoading(false);
      Alert.alert('Error', 'Password must be at least 8 characters long, contain a lowercase letter, and a non-alphanumeric character');
      return;
    }

    try {
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);

    const studyProgramsRef = collection(userRef, 'studyPrograms');
    const studyProgramSnapshots = await getDocs(studyProgramsRef);

    for (const programDoc of studyProgramSnapshots.docs) {
      const coursesRef = collection(programDoc.ref, 'courses');
      const courseSnapshots = await getDocs(coursesRef);

      for (const courseDoc of courseSnapshots.docs) {
        await deleteDoc(courseDoc.ref);
      }

      await deleteDoc(programDoc.ref);
    }

    await deleteDoc(userRef);
  };

  const handleDeleteAccount = async (password) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);

      await reauthenticateWithCredential(user, credential);

      await deleteUserData(user.uid);

      await deleteUser(user);

      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
    } catch (error) {
      console.error("Account deletion failed:", error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch
              value={theme === "dark"}
              onValueChange={val => setAppTheme(val ? "dark" : "light")}
              thumbColor={isDark ? "#CA4B4B" : "#ccc"}
              trackColor={{ false: "#bbb", true: "#CA4B4B" }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowNameModal(true)}
            accessibilityLabel="Change Name Button"
          >
            <Text style={styles.buttonText}>Change Name</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowEmailModal(true)}
            accessibilityLabel='Change Email Button'
          >
            <Text style={styles.buttonText}>Change Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowPasswordModal(true)}
            accessibilityLabel='Change Password Button'
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setReauthVisible(true)}
            accessibilityLabel="Delete Account Button"
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Privacy</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("LegalScreen")}
            accessibilityLabel="Legal & Privacy"
          >
            <Text style={styles.buttonText}>Legal & Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditFieldModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        label="New Name"
        onSave={handleUpdateName}
        defaultValue={user.displayName || ''}
      />
      <EditFieldModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        label="New Email"
        onSave={handleUpdateEmail}
        defaultValue={user.email || ''}
      />
      <EditFieldModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        label="New Password"
        defaultValue={'Enter new password'}
        onSave={handleUpdatePassword}
        secureTextEntry
      />
      <ReauthModal
        visible={isReauthVisible}
        onClose={() => setReauthVisible(false)}
        onConfirm={(password) => {
          setReauthVisible(false);
          handleDeleteAccount(password);
        }}
      />

      {loading && (
        <ActivityIndicator size="large" color="#CA4B4B" style={{ marginVertical: 20 }} />
      )}
    </View>
  );
};

export default Settings;

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CA4B4B',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#CA4B4B',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#222',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#fff',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#CA4B4B',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#CA4B4B',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
