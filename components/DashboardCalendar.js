import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardCalendar({ selectedDate, onDayPress, isDark }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [date, setDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [examsByDate, setExamsByDate] = useState({});
  const [loadingExams, setLoadingExams] = useState(true);
  const [viewExam, setViewExam] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const examsRef = collection(db, 'users', user.uid, 'exams');
        const snapshot = await getDocs(examsRef);
        const exams = {};
        const marks = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          exams[data.date] = { id: doc.id, ...data };
          marks[data.date] = {
            marked: true,
            dotColor: '#CA4B4B',
            selected: selectedDate === data.date,
            selectedColor: selectedDate === data.date ? '#CA4B4B' : undefined,
          };
        });

        setExamsByDate(exams);
        setMarkedDates(marks);
      } catch (error) {
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, [selectedDate, modalVisible]);

  const handleDayPress = (day) => {
    setDate(day.dateString);
    if (examsByDate[day.dateString]) {
      setViewExam(examsByDate[day.dateString]);
      setModalVisible(true);
    } else {
      setViewExam(null);
      setModalVisible(true);
    }
    if (onDayPress) onDayPress(day);
  };

  const handleAddExam = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !date || !examName) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'exams'), {
        name: examName,
        description: examDesc,
        date: date,
        createdAt: new Date()
      });
      setModalVisible(false);
      setExamName('');
      setExamDesc('');
    } catch (error) {
      alert('Failed to add exam.');
    }
  };

  const handleDeleteExam = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !viewExam) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'exams', viewExam.id));
      setModalVisible(false);
      setViewExam(null);
      setExamName('');
      setExamDesc('');
    } catch (error) {
      alert('Failed to delete exam.');
    }
  };

  return (
    <View style={{ marginBottom: 28, paddingHorizontal: 8 }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: isDark ? '#181818' : '#fff',
          calendarBackground: isDark ? '#181818' : '#fff',
          textSectionTitleColor: isDark ? '#bbb' : '#222',
          selectedDayBackgroundColor: '#CA4B4B',
          selectedDayTextColor: '#fff',
          todayTextColor: '#CA4B4B',
          dayTextColor: isDark ? '#fff' : '#222',
          textDisabledColor: isDark ? '#444' : '#ccc',
          monthTextColor: '#CA4B4B',
          arrowColor: '#CA4B4B',
          dotColor: isDark ? '#fff' : '#CA4B4B',
          indicatorColor: isDark ? '#fff' : '#CA4B4B',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={{
          borderRadius: 12,
          elevation: 2,
          marginBottom: 10,
          marginHorizontal: 8,
          backgroundColor: isDark ? '#181818' : '#fff',
        }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={[modalStyles.modal, { backgroundColor: isDark ? '#222' : '#fff' }]}>
            <View style={modalStyles.modalHeader}>
              <Text style={[modalStyles.title, { color: '#CA4B4B', flex: 1 }]}>
                {viewExam ? 'Exam Details' : 'Add Exam'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={modalStyles.closeIcon}
                accessibilityLabel="Close Modal"
              >
                <Ionicons name="close" size={26} color={isDark ? "#fff" : "#222"} />
              </TouchableOpacity>
            </View>
            {viewExam ? (
              <View style={modalStyles.examBody}>
                <View style={modalStyles.iconRow}>
                  <Ionicons name="calendar-outline" size={22} color="#CA4B4B" />
                  <Text style={[modalStyles.label, { color: isDark ? '#fff' : '#222', marginLeft: 6 }]}>
                    {viewExam.date}
                  </Text>
                </View>
                <View style={modalStyles.iconRow}>
                  <Ionicons name="document-text-outline" size={22} color="#CA4B4B" />
                  <Text style={[modalStyles.label, { color: isDark ? '#fff' : '#222', fontWeight: 'bold', marginLeft: 6, flex: 1 }]}>
                    {viewExam.name}
                  </Text>
                  <TouchableOpacity
                    style={[modalStyles.iconButton, { backgroundColor: '#CA4B4B', marginLeft: 8 }]}
                    onPress={handleDeleteExam}
                    accessibilityLabel="Delete Exam"
                  >
                    <Ionicons name="trash" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                {viewExam.description ? (
                  <View style={modalStyles.iconRow}>
                    <Ionicons name="information-circle-outline" size={22} color="#CA4B4B" />
                    <Text style={[modalStyles.label, { color: isDark ? '#fff' : '#222', marginLeft: 6 }]}>
                      {viewExam.description}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={modalStyles.examBody}>
                <View style={modalStyles.iconRow}>
                  <Ionicons name="calendar-outline" size={22} color="#CA4B4B" />
                  <Text style={[modalStyles.label, { color: isDark ? '#fff' : '#222', marginLeft: 6 }]}>
                    {date}
                  </Text>
                </View>
                <View style={modalStyles.iconRow}>
                  <TextInput
                    style={[
                      modalStyles.input,
                      {
                        color: isDark ? '#fff' : '#222',
                        backgroundColor: isDark ? '#181818' : '#f5f5f5',
                        flex: 1,
                        marginBottom: 0,
                      }
                    ]}
                    placeholder="Exam Name"
                    placeholderTextColor={isDark ? "#bbb" : "#888"}
                    value={examName}
                    onChangeText={setExamName}
                  />
                  <TouchableOpacity
                    style={[modalStyles.iconButton, { backgroundColor: '#CA4B4B', marginLeft: 8 }]}
                    onPress={handleAddExam}
                    accessibilityLabel="Add Exam"
                  >
                    <Ionicons name="add" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    modalStyles.input,
                    {
                      color: isDark ? '#fff' : '#222',
                      backgroundColor: isDark ? '#181818' : '#f5f5f5',
                      marginTop: 10,
                    }
                  ]}
                  placeholder="Description (optional)"
                  placeholderTextColor={isDark ? "#bbb" : "#888"}
                  value={examDesc}
                  onChangeText={setExamDesc}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {loadingExams && (
        <ActivityIndicator size="small" color="#CA4B4B" style={{ marginTop: 10 }} />
      )}
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: 16,
    padding: 0,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  examBody: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  iconButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});