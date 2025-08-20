import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const EditGradeScreen = ({ route, navigation }) => {
  const { yearId, courseId, gradeId, gradeData } = route.params;
  const [examName, setExamName] = useState(gradeData.examName || '');
  const [grade, setGrade] = useState(String(gradeData.grade || ''));
  const [weight, setWeight] = useState(String(gradeData.weight || ''));
  const [description, setDescription] = useState(gradeData.description || '');

  const handleUpdateGrade = async () => {
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
      const gradeRef = doc(
        db,
        'users',
        user.uid,
        'studyPrograms',
        yearId,
        'courses',
        courseId,
        'grades',
        gradeId
      );
      await updateDoc(gradeRef, {
        examName,
        grade: gradeValue,
        weight: weightValue,
        description,
      });
      Alert.alert('Success', 'Grade updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update grade. Please try again.');
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
        <Text style={styles.title}>Edit Grade</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleUpdateGrade} accessibilityLabel="Update Grade Button">
          <Text style={styles.buttonText}>Update Grade</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditGradeScreen;

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