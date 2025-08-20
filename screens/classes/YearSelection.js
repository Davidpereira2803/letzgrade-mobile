import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { db } from "../../services/firebase";
import { getAuth } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import allClasses from '../../assets/classes/classes.json'; 
import { useTheme } from '../../context/ThemeContext';

const schoolYears = allClasses
  .map(cls => cls.name)
  .sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });


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
});

const YearSelection = ({ navigation }) => {
    const [addedYears, setAddedYears] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const handleYearPress = async (year) => {
      setLoading(true);
      const selectedClass = allClasses.find(cls => cls.name === year);
      if (!selectedClass) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
          console.error("User not logged in");
          return;
      }

      try {
          const programRef = doc(db, 'users', user.uid, 'studyPrograms', selectedClass.name);
          await setDoc(programRef, {
          name: selectedClass.name,
          hasExams: selectedClass.hasExams,
          createdAt: Date.now()
          });

          for (const subject of selectedClass.subjects) {
          const courseRef = doc(programRef, 'courses', subject.name);
          await setDoc(courseRef, {
              name: subject.name,
              credits: subject.coef,
              ...(subject.subSubjects ? { subSubjects: subject.subSubjects } : {})
          });
          }

          navigation.navigate('Dashboard');
      } catch (err) {
          console.error("Error adding year to Firestore:", err);
          Alert.alert("Error", "Failed to add year. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your school year</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#CA4B4B" style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={schoolYears}
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
