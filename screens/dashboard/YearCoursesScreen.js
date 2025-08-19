import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native';

const YearCoursesScreen = ({ route, navigation }) => {
  const { yearId } = route.params;
  const [courses, setCourses] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${yearId} Courses`,
    });
  }, [navigation, yearId]);

  useEffect(() => {
    const fetchCourses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const coursesRef = collection(db, 'users', user.uid, 'studyPrograms', yearId, 'courses');
        const snapshot = await getDocs(coursesRef);
        const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setCourses(courseList);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch courses. Please try again later.");
      }
    };

    fetchCourses();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {courses.length === 0 ? (
          <Text>No courses found for this year.</Text>
        ) : (
          courses.map(course => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseBox}
              onPress={() => navigation.navigate('AddGradeScreen', { yearId, courseId: course.id, courseName: course.name })}
              accessibilityLabel={`Add grade to ${course.name}`}
            >
              <Text style={styles.courseName}>{course.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default YearCoursesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
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
