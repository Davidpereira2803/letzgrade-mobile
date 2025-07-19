import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

const YearCoursesScreen = ({ route }) => {
  const { yearId } = route.params;
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const coursesRef = collection(db, 'users', user.uid, 'studyPrograms', yearId, 'courses');
      const snapshot = await getDocs(coursesRef);
      const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{yearId} Courses</Text>
      {courses.length === 0 ? (
        <Text>No courses found for this year.</Text>
      ) : (
        courses.map(course => (
          <View key={course.id} style={styles.courseBox}>
            <Text>{course.name} ({course.credits} credits)</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default YearCoursesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  courseBox: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
});
