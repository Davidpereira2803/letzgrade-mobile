import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput } from 'react-native';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import allClasses from '../../assets/classes/classes.json'; 
import { useTheme } from '../../context/ThemeContext';

// Updated: Use "year" and "courses" keys from new classes.json structure
const schoolYears = allClasses
  .map(cls => cls.year)
  .filter(year => typeof year === 'string' && year.length > 0);

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  list: {
    paddingBottom: 20,
  },
  yearButton: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#181818',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  yearButton: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    color: '#fff',
    backgroundColor: '#222',
  },
});

async function ensureSemestersHaveCourses(yearId, userId) {
  const semesterIds = ['semester1', 'semester2'];
  const yearCoursesRef = collection(
    db,
    'users',
    userId,
    'studyPrograms',
    yearId,
    'courses'
  );
  const yearCoursesSnap = await getDocs(yearCoursesRef);
  const yearCourses = yearCoursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  for (const semesterId of semesterIds) {
    const semesterCoursesRef = collection(
      db,
      'users',
      userId,
      'studyPrograms',
      yearId,
      'semesters',
      semesterId,
      'courses'
    );
    const semesterCoursesSnap = await getDocs(semesterCoursesRef);
    if (semesterCoursesSnap.empty) {
      await Promise.all(yearCourses.map(async (course) => {
        const semesterCourseRef = doc(
          db,
          'users',
          userId,
          'studyPrograms',
          yearId,
          'semesters',
          semesterId,
          'courses',
          course.id
        );
        await setDoc(semesterCourseRef, course);
      }));
    }
  }
}

const YearSelection = ({ navigation }) => {
  const [addedYears, setAddedYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  useEffect(() => {
    const fetchExistingYears = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const studyProgramsSnapshot = await getDocs(collection(db, 'users', user.uid, 'studyPrograms'));
      const yearNames = studyProgramsSnapshot.docs.map(doc => doc.id);
      setAddedYears(yearNames);
      setLoading(false);
    };

    fetchExistingYears();
  }, []);

  // Updated: Use "year" and "courses" keys
  const handleYearPress = async (year) => {
    setLoading(true);
    const selectedClass = allClasses.find(cls => cls.year === year);
    if (!selectedClass) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const programRef = doc(db, 'users', user.uid, 'studyPrograms', selectedClass.year);
      await setDoc(programRef, {
        year: selectedClass.year,
        createdAt: Date.now()
      });

      // Use course.name instead of course.label
      for (const course of selectedClass.courses) {
        const courseRef = doc(programRef, 'courses', course.code);
        await setDoc(courseRef, {
          code: course.code,
          name: course.name, // <-- changed from label to name
          coeff: course.coeff
        });
      }

      await ensureSemestersHaveCourses(selectedClass.year, user.uid);

      navigation.navigate('Dashboard');
    } catch (err) {
      console.error("Error adding year to Firestore:", err);
      Alert.alert("Error", "Failed to add year. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredYears = schoolYears.filter(year =>
    year.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your school year</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search year..."
        placeholderTextColor={isDark ? "#bbb" : "#888"}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search School Year"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#CA4B4B" style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={filteredYears}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.yearButton,
                { opacity: addedYears.includes(item) || loading ? 0.5 : 1 }
              ]}
              disabled={addedYears.includes(item) || loading}
              onPress={() => handleYearPress(item)}
              accessibilityLabel={`Select year ${item}`}
            >
              <Text style={styles.yearText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default YearSelection;
