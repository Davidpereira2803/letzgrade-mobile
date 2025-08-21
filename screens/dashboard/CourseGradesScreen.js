import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, useColorScheme, Share } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#222' },
  gradeBox: { backgroundColor: '#f2f2f2', padding: 12, borderRadius: 8, marginBottom: 12 },
  examName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#222' },
  button: { backgroundColor: '#CA4B4B', padding: 15, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

const darkStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#181818' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
  gradeBox: { backgroundColor: '#222', padding: 12, borderRadius: 8, marginBottom: 12 },
  examName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#fff' },
  button: { backgroundColor: '#CA4B4B', padding: 15, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

const CourseGradesScreen = ({ route, navigation }) => {
  const { yearId, courseId, courseName } = route.params;
  const [grades, setGrades] = useState([]);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const fetchGrades = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const gradesRef = collection(
      db,
      'users',
      user.uid,
      'studyPrograms',
      yearId,
      'courses',
      courseId,
      'grades'
    );
    const snapshot = await getDocs(gradesRef);
    setGrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchGrades);
    return unsubscribe;
  }, [navigation, yearId, courseId]);

  const computeWeightedAverage = () => {
    if (grades.length === 0) return null;
    let totalWeighted = 0;
    let totalWeight = 0;
    grades.forEach(g => {
      const grade = Number(g.grade);
      const weight = Number(g.weight);
      if (!isNaN(grade) && !isNaN(weight) && weight > 0) {
        totalWeighted += grade * weight;
        totalWeight += weight;
      }
    });
    if (totalWeight === 0) return null;
    return (totalWeighted / totalWeight).toFixed(2);
  };

  const handleDeleteGrade = async (gradeId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(
        db,
        'users',
        user.uid,
        'studyPrograms',
        yearId,
        'courses',
        courseId,
        'grades',
        gradeId
      ));
      await fetchGrades();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete grade.');
    }
  };

  const handleShareAverage = () => {
    let message = average !== null
      ? `My average for ${courseName} is ${average} / 60.\n\nGrades:\n`
      : `No grades yet for ${courseName}.`;

    if (grades.length > 0) {
      grades.forEach(g => {
        message += `• ${g.examName}\n  Grade: ${g.grade} / 60\n  Weight: ${g.weight}\n`;
        if (g.description) {
          message += `  Description: ${g.description}\n`;
        }
        message += '\n';
      });
    }

    Share.share({ message });
  };

  const average = computeWeightedAverage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {courseName} - Average: {average !== null ? `${average} / 60` : 'N/A'}
      </Text>
      <FlatList
        data={grades}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.gradeBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.examName}>{item.examName}</Text>
                <Text style={{ color: isDark ? "#fff" : "#222" }}>Grade: {item.grade} / 60</Text>
                <Text style={{ color: isDark ? "#fff" : "#222" }}>Weight: {item.weight}</Text>
                {item.description ? <Text style={{ color: isDark ? "#bbb" : "#666" }}>Description: {item.description}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditGradeScreen', {
                    yearId,
                    courseId,
                    gradeId: item.id,
                    gradeData: item
                  })}
                  accessibilityLabel="Edit Grade"
                  style={{ marginRight: 12 }}
                >
                  <Ionicons name="create-outline" size={22} color="#CA4B4B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteGrade(item.id)}
                  accessibilityLabel="Delete Grade"
                >
                  <Ionicons name="trash-outline" size={22} color="#CA4B4B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddGradeScreen', { yearId, courseId, courseName })}
        accessibilityLabel="Add Grade Button"
      >
        <Text style={styles.buttonText}>Add Grade</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#888', marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
        onPress={handleShareAverage}
        accessibilityLabel="Share Average Button"
      >
        <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={[styles.buttonText, { fontSize: 15 }]}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CourseGradesScreen;