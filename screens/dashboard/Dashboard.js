import React , { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import { logout, db } from '../../services/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import MenuModal from '../../components/MenuModal';
import LottieView from "lottie-react-native";
import { Ionicons } from '@expo/vector-icons';

const Dashboard = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const animationRef = useRef(null);

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const studyProgramsRef = collection(db, 'users', user.uid, 'studyPrograms');
        const snapshot = await getDocs(studyProgramsRef);

        const yearList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setYears(yearList);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch years. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteYear = (yearName) => {
    Alert.alert(
      "Delete Year",
      `Are you sure you want to delete ${yearName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const yearRef = doc(db, 'users', auth.currentUser.uid, 'studyPrograms', yearName);
              await deleteDoc(yearRef);
              setYears(prev => prev.filter(p => p.id !== yearName));
            } catch (error) {
              Alert.alert("Error", "Failed to delete year. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Icon name="menu" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Dashboard</Text>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Icon name="person-circle" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <MenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onLogout={handleLogout}
          navigation={navigation}
        />

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.welcome}>Welcome to LetzGrade Dashboard!</Text>
          <LottieView
              ref={animationRef}
              source={require("../../assets/animations/graph-animation.json")}
              autoPlay
              loop
              style={styles.animation}
          />
          <Text style={styles.welcome}>Your Classes:</Text>

          {loading ? (
            <Text>Loading...</Text>
          ) : years.length === 0 ? (
            <Text>No years found.</Text>
          ) : (
            years.map((year) => (

          <TouchableOpacity
            key={year.id}
            style={styles.yearRowButton}
            onPress={() => navigation.navigate('YearCourses', { yearId: year.id })}
            accessibilityLabel={`Open ${year.id} details`}
          >
            <Text style={styles.yearText}>{year.id}</Text>
            <TouchableOpacity
              onPress={() => handleDeleteYear(year.id)}
              style={styles.trashButton}
              accessibilityLabel={`Delete ${year.id}`}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>

            ))
          )}

        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  courseItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  yearRowButton: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    width: '80%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  trashButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
    adContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  adPlaceholder: {
    width: "100%",
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
