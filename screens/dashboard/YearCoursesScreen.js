import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  yearAverage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 18,
    textAlign: 'center',
  },
  courseBox: {
    marginBottom: 12,
    padding: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
  },
  courseCredits: {
    fontSize: 14,
    color: '#888',
  },
  courseAverage: {
    fontSize: 14,
    color: '#CA4B4B',
  },
  noCourses: {
    color: '#222',
    textAlign: 'center',
    marginTop: 20,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#181818',
  },
  yearAverage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 18,
    textAlign: 'center',
  },
  courseBox: {
    marginBottom: 12,
    padding: 0,
    backgroundColor: '#222',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  courseCredits: {
    fontSize: 14,
    color: '#bbb',
  },
  courseAverage: {
    fontSize: 14,
    color: '#CA4B4B',
  },
  noCourses: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

const YearCoursesScreen = ({ route, navigation }) => {
  const { yearId, semesterId } = route.params;
  const [courses, setCourses] = useState([]);
  const [yearAverage, setYearAverage] = useState(null);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const fetchCoursesAndGrades = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const coursesRef = collection(
        db,
        'users',
        user.uid,
        'studyPrograms',
        yearId,
        'semesters',
        semesterId,
        'courses'
      );
      const snapshot = await getDocs(coursesRef);
      const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let totalWeighted = 0;
      let totalCredits = 0;
      const coursesWithAverages = await Promise.all(courseList.map(async course => {
        const gradesRef = collection(
          db,
          'users',
          user.uid,
          'studyPrograms',
          yearId,
          'semesters',
          semesterId,
          'courses',
          course.id,
          'grades'
        );
        const gradesSnap = await getDocs(gradesRef);
        const grades = gradesSnap.docs.map(doc => doc.data());

        let courseWeighted = 0;
        let courseTotalWeight = 0;
        grades.forEach(g => {
          const grade = Number(g.grade);
          const weight = Number(g.weight);
          if (!isNaN(grade) && !isNaN(weight) && weight > 0) {
            courseWeighted += grade * weight;
            courseTotalWeight += weight;
          }
        });
        const courseAverage = courseTotalWeight > 0 ? courseWeighted / courseTotalWeight : null;

        const credits = Number(course.credits) || 0;
        if (courseAverage !== null && credits > 0) {
          totalWeighted += courseAverage * credits;
          totalCredits += credits;
        }

        return { ...course, average: courseAverage };
      }));

      setCourses(coursesWithAverages);
      setYearAverage(totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : null);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch courses or grades. Please try again later.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${yearId} Courses`,
    });
  }, [navigation, yearId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCoursesAndGrades);
    fetchCoursesAndGrades();
    return unsubscribe;
  }, [navigation, yearId, semesterId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.yearAverage}>
          Semester Average: {yearAverage !== null ? `${yearAverage} / 60` : 'N/A'}
        </Text>
        {courses.length === 0 ? (
          <Text style={styles.noCourses}>No courses found for this semester.</Text>
        ) : (
          courses.map(course => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseBox}
              onPress={() => navigation.navigate('CourseGradesScreen', {
                yearId,
                semesterId,
                courseId: course.id,
                courseName: course.label
              })}
              accessibilityLabel={`View grades for ${course.label}`}
              activeOpacity={0.7}
            >
              <View style={styles.courseRow}>
                <Ionicons name="book-outline" size={24} color="#CA4B4B" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName}>{course.label}</Text>
                  <Text style={styles.courseCredits}>Credits: {course.credits || 'N/A'}</Text>
                  <Text style={styles.courseAverage}>
                    Average: {course.average !== null ? `${course.average.toFixed(2)} / 60` : 'N/A'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#bbb" : "#888"} style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default YearCoursesScreen;
