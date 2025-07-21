import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const EditFieldModal = ({ visible, onClose, label, onSave, defaultValue, secureTextEntry = false }) => {
  const [value, setValue] = useState(defaultValue || '');

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            secureTextEntry={secureTextEntry}
            placeholder={label}
            placeholderTextColor="#777"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.save]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditFieldModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  save: {
    backgroundColor: '#CA4B4B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
