import { View, Text, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

const MenuModal = ({ visible, onClose, onLogout, navigation }) => {
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
        <TouchableHighlight
          onPress={() => {
            onClose();
            navigation.navigate("YearSelection");
          }}
          underlayColor="#f2f2f2"
          accessibilityLabel="Go to Year Selection"
          style={styles.menuHighlight}
        >
          <Text style={styles.menuItem}> Year Selection</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            onClose();
            navigation.navigate("Settings");
          }}
          underlayColor="#f2f2f2"
          accessibilityLabel="Go to Settings"
          style={styles.menuHighlight}
        >
          <Text style={styles.menuItem}> Settings</Text>
        </TouchableHighlight>
        <TouchableOpacity
          style={styles.button}
          onPress={onLogout}
          accessibilityLabel="Logout"
        >
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
  menuHighlight: {
    borderRadius: 6,
  },
});
