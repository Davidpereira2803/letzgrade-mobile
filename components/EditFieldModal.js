import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const EditFieldModal = ({ visible, onClose, label, onSave, defaultValue, secureTextEntry = false }) => {
  const [value, setValue] = useState('');
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  useEffect(() => {
    if (visible) setValue(defaultValue || '');
  }, [visible, defaultValue]);

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
            placeholder={defaultValue || "Enter new value"}
            placeholderTextColor={isDark ? "#bbb" : "#777"}
            accessibilityLabel={`${label} Input`}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]} accessibilityLabel="Cancel Edit">
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.save]} accessibilityLabel="Save Edit">
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditFieldModal;

const lightStyles = StyleSheet.create({
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
    color: '#222',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
    color: '#222',
    backgroundColor: '#fff',
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

const darkStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#222',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#444',
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
    backgroundColor: '#222',
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
    backgroundColor: '#444',
  },
  save: {
    backgroundColor: '#CA4B4B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
