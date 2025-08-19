import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddGradeScreen = ({ route, navigation }) => {
  const { courseId, courseName, yearId } = route.params;
  const [examName, setExamName] = useState('');
  const [grade, setGrade] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');

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
      Alert.alert('Success', 'Grade added!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add grade. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Grade to {courseName}</Text>
      <TextInput
        style={styles.input}
        placeholder="Exam Name"
        value={examName}
        onChangeText={setExamName}
        accessibilityLabel="Exam Name Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Grade (out of 60)"
        value={grade}
        onChangeText={setGrade}
        keyboardType="numeric"
        accessibilityLabel="Grade Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Exam Weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        accessibilityLabel="Exam Weight Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        accessibilityLabel="Description Input"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddGrade} accessibilityLabel="Add Grade Button">
        <Text style={styles.buttonText}>Add Grade</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddGradeScreen;

const styles = StyleSheet.create({
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    color: '#333',
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