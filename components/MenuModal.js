import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

const MenuModal = ({ visible, onClose, onLogout }) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.3}
      animationIn="fadeInDown"
      animationOut="fadeOutUp"
      style={styles.menuModal}
    >
      <View style={styles.menuCard}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.menuItem}> Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.menuItem}> Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.menuItem}> Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}> Logout</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({
  menuModal: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
    paddingTop: 90,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
  },
});
