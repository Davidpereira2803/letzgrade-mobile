import React from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const UpdateModal = ({ visible, title, placeholder, value, onChangeText, onSubmit, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#777"
            secureTextEntry={title.toLowerCase().includes('password')}
          />
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSubmit} style={[styles.button, styles.save]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: '85%',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  save: {
    backgroundColor: '#CA4B4B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
