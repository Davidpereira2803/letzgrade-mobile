import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';

const ReauthModal = ({ visible, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (!password) {
      Alert.alert("Please enter your password");
      return;
    }
    onConfirm(password);
    setPassword('');
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <Text style={styles.title}>Re-authentication Required</Text>
        <TextInput
          placeholder="Enter password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ReauthModal;

const styles = StyleSheet.create({
  modal: { justifyContent: 'center', alignItems: 'center' },
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cancelText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 5
  }
});
