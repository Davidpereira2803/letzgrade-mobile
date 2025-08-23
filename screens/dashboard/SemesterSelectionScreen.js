import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    flex: 1,
    textAlign: 'center',
  },
  averagesBox: {
    marginBottom: 18,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#CA4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    elevation: 1,
  },
  averageLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 4,
    fontWeight: '600',
  },
  averageValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 2,
    textAlign: 'center',
  },
  fractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  fractionTop: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    lineHeight: 24,
  },
  fractionLine: {
    width: 32,
    height: 2,
    backgroundColor: '#CA4B4B',
    marginVertical: 2,
  },
  fractionBottom: {
    fontSize: 16,
    color: '#CA4B4B',
    lineHeight: 18,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  button: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tipBox: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFEFEF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    color: '#CA4B4B',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 0,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    flex: 1,
    textAlign: 'center',
  },
  averagesBox: {
    marginBottom: 18,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#CA4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#181818',
    elevation: 1,
  },
  averageLabel: {
    fontSize: 15,
    color: '#bbb',
    marginBottom: 4,
    fontWeight: '600',
  },
  averageValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 2,
    textAlign: 'center',
  },
  fractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  fractionTop: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA4B4B',
    lineHeight: 24,
  },
  fractionLine: {
    width: 32,
    height: 2,
    backgroundColor: '#CA4B4B',
    marginVertical: 2,
  },
  fractionBottom: {
    fontSize: 16,
    color: '#CA4B4B',
    lineHeight: 18,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  button: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tipBox: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#2a1a1a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    color: '#CA4B4B',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

const motivationalTips = [
  "Keep going! Every grade is a step forward.",
  "Consistency is key. Small improvements matter.",
  "Semester averages help you track your progress.",
  "Don't forget to celebrate your achievements!",
  "Use your strengths to boost your weaker subjects.",
  "A new semester is a new opportunity.",
];

function getRandomTip() {
  return motivationalTips[Math.floor(Math.random() * motivationalTips.length)];
}

export default function SemesterSelectionScreen({ navigation, route }) {
  const { yearId } = route.params;
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const [loading, setLoading] = useState(true);
  const [semester1Avg, setSemester1Avg] = useState(null);
  const [semester2Avg, setSemester2Avg] = useState(null);
  const [yearAvg, setYearAvg] = useState(null);
  const [tip, setTip] = useState(getRandomTip());

  useEffect(() => {
    setTip(getRandomTip());
    const fetchAverages = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const getSemesterAverage = async (semesterId) => {
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
        const coursesSnap = await getDocs(coursesRef);
        const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let totalWeighted = 0;
        let totalCredits = 0;

        for (const course of courses) {
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
        }
        return totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : null;
      };

      const avg1 = await getSemesterAverage('semester1');
      const avg2 = await getSemesterAverage('semester2');
      setSemester1Avg(avg1);
      setSemester2Avg(avg2);

      let yearAverage = null;
      if (avg1 !== null && avg2 !== null) {
        yearAverage = ((parseFloat(avg1) + parseFloat(avg2)) / 2).toFixed(2);
      } else if (avg1 !== null) {
        yearAverage = avg1;
      } else if (avg2 !== null) {
        yearAverage = avg2;
      }
      setYearAvg(yearAverage);
      setLoading(false);
    };

    fetchAverages();
  }, [yearId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.averagesBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#CA4B4B" />
          ) : (
            <>
              <View style={styles.averageCard}>
                <Ionicons name="medal-outline" size={28} color="#CA4B4B" style={styles.averageIcon} />
                <Text style={styles.averageLabel}>Semester 1</Text>
                <View style={styles.fractionContainer}>
                  <Text style={styles.fractionTop}>
                    {semester1Avg !== null ? semester1Avg : 'N/A'}
                  </Text>
                  <View style={styles.fractionLine} />
                  <Text style={styles.fractionBottom}>60</Text>
                </View>
              </View>
              <View style={styles.averageCard}>
                <Ionicons name="medal-outline" size={28} color="#CA4B4B" style={styles.averageIcon} />
                <Text style={styles.averageLabel}>Semester 2</Text>
                <View style={styles.fractionContainer}>
                  <Text style={styles.fractionTop}>
                    {semester2Avg !== null ? semester2Avg : 'N/A'}
                  </Text>
                  <View style={styles.fractionLine} />
                  <Text style={styles.fractionBottom}>60</Text>
                </View>
              </View>
              <View style={styles.averageCard}>
                <Ionicons name="trophy-outline" size={28} color="#CA4B4B" style={styles.averageIcon} />
                <Text style={styles.averageLabel}>Year</Text>
                <View style={styles.fractionContainer}>
                  <Text style={styles.fractionTop}>
                    {yearAvg !== null ? yearAvg : 'N/A'}
                  </Text>
                  <View style={styles.fractionLine} />
                  <Text style={styles.fractionBottom}>60</Text>
                </View>
              </View>
            </>
          )}
        </View>
        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={22} color="#CA4B4B" />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('YearCoursesScreen', { yearId, semesterId: 'semester1' })}
          accessibilityLabel="Go to Semester 1"
        >
          <Ionicons name="school-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Semester 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('YearCoursesScreen', { yearId, semesterId: 'semester2' })}
          accessibilityLabel="Go to Semester 2"
        >
          <Ionicons name="school-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Semester 2</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}