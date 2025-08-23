import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#181818',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: '#fff',
    backgroundColor: '#222',
  },
  button: {
    backgroundColor: '#CA4B4B',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const AddGradeScreen = ({ route, navigation }) => {
  const { courseId, courseName, yearId, semesterId } = route.params;
  const [examName, setExamName] = useState('');
  const [grade, setGrade] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;

  const handleAddGrade = async () => {
    Keyboard.dismiss();
    if (!examName || !grade || !weight) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    const gradeValue = Number(grade);
    const weightValue = Number(weight);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 60) {
      Alert.alert('Error', 'Grade must be a number between 0 and 60.');
      return;
    }
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Error', 'Weight must be a positive number.');
      return;
    }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      const gradesRef = collection(
        db,
        'users',
        user.uid,
        'studyPrograms',
        yearId,
        'semesters',
        semesterId,
        'courses',
        courseId,
        'grades'
      );
      await addDoc(gradesRef, {
        examName,
        grade: gradeValue,
        weight: weightValue,
        description,
        createdAt: new Date()
      });
    
    if (gradeValue >= 50) {
      Alert.alert('Great job!', 'You scored very high on this exam!');
    } else if (gradeValue >= 40) {
      Alert.alert('Good work!', 'Solid score, keep it up!');
    } else if (gradeValue >= 30) {
      Alert.alert('Keep going!', 'You passed, but there is room to improve.');
    } else {
      Alert.alert('Don\'t give up!', 'Consider reviewing the material and trying again.');
    }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add grade. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add Grade to {courseName}</Text>
        <TextInput
          style={styles.input}
          placeholder="Exam Name"
          placeholderTextColor={isDark ? "#bbb" : "#777"}
          value={examName}
          onChangeText={setExamName}
          accessibilityLabel="Exam Name Input"
        />
        <TextInput
          style={styles.input}
          placeholder="Grade (out of 60)"
          placeholderTextColor={isDark ? "#bbb" : "#777"}
          value={grade}
          onChangeText={setGrade}
          keyboardType="numeric"
          accessibilityLabel="Grade Input"
        />
        <TextInput
          style={styles.input}
          placeholder="Exam Weight (%)"
          placeholderTextColor={isDark ? "#bbb" : "#777"}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          accessibilityLabel="Exam Weight Input"
        />
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          placeholderTextColor={isDark ? "#bbb" : "#777"}
          value={description}
          onChangeText={setDescription}
          accessibilityLabel="Description Input"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddGrade} accessibilityLabel="Add Grade Button">
          <Text style={styles.buttonText}>Add Grade</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddGradeScreen;