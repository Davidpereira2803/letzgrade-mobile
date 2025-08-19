import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { auth, db } from '../../services/firebase';
import { updateProfile, updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import EditFieldModal from '../../components/EditFieldModal';
import ReauthModal from '../../components/ReauthModal';
import { se } from 'date-fns/locale';
import { set } from 'date-fns';

const Settings = () => {
  const user = auth.currentUser;
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isReauthVisible, setReauthVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      
      <Text style={styles.title}>Settings</Text>

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

      <TouchableOpacity
        style={{
          backgroundColor: '#CA4B4B',
          padding: 12,
          marginTop: 30,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setReauthVisible(true)}
        accessibilityLabel="Delete Account Button"
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete Account</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
