import React , { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout, db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import MenuModal from '../../components/MenuModal';

const Dashboard = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const studyProgramsRef = collection(db, 'users', user.uid, 'studyPrograms');
        const programSnapshot = await getDocs(studyProgramsRef);

        let allCourses = [];

        for (const programDoc of programSnapshot.docs) {
          const coursesRef = collection(db, 'users', user.uid, 'studyPrograms', programDoc.id, 'courses');
          const courseSnapshot = await getDocs(coursesRef);

          const programCourses = courseSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          allCourses = [...allCourses, ...programCourses];
        }

        setCourses(allCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
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

      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome to LetzGrade Dashboard!</Text>
        <Text style={styles.welcome}>Your Classes:</Text>

        {courses.length === 0 ? (
          <Text>Loading or no courses found.</Text>
        ) : (
          courses.map((course) => (
            <Text key={course.id} style={styles.courseItem}>
              {course.name} ({course.credits} credits)
            </Text>
          ))
        )}
      </View>

    </View>
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
});
