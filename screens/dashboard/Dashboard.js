import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { logout, db } from '../../services/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import MenuModal from '../../components/MenuModal';
import LottieView from "lottie-react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import DashboardCalendar from '../../components/DashboardCalendar';
import { Button } from 'react-native';

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 32,
  },
  section: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
    color: '#222'
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 8,
    textAlign: 'center'
  },
  yearRowButton: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  trashButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noYears: {
    color: '#222',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    color: '#222',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818'
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 32,
  },
  section: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
    color: '#fff'
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CA4B4B',
    marginBottom: 8,
    textAlign: 'center'
  },
  yearRowButton: {
    backgroundColor: '#CA4B4B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  trashButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noYears: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

const Dashboard = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const animationRef = useRef(null);
  const { isDark } = useTheme();
  const styles = isDark ? darkStyles : lightStyles;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const studyProgramsRef = collection(db, 'users', user.uid, 'studyPrograms');
        const snapshot = await getDocs(studyProgramsRef);

        const yearList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setYears(yearList);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch years. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteYear = (yearId) => {
    Alert.alert(
      "Delete Year",
      `Are you sure you want to delete ${yearId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const userId = auth.currentUser.uid;
              const yearRef = doc(db, 'users', userId, 'studyPrograms', yearId);

              const semestersRef = collection(db, 'users', userId, 'studyPrograms', yearId, 'semesters');
              const semestersSnap = await getDocs(semestersRef);

              for (const semesterDoc of semestersSnap.docs) {
                const semesterId = semesterDoc.id;
                const coursesRef = collection(db, 'users', userId, 'studyPrograms', yearId, 'semesters', semesterId, 'courses');
                const coursesSnap = await getDocs(coursesRef);

                for (const courseDoc of coursesSnap.docs) {
                  const courseId = courseDoc.id;
                  const gradesRef = collection(db, 'users', userId, 'studyPrograms', yearId, 'semesters', semesterId, 'courses', courseId, 'grades');
                  const gradesSnap = await getDocs(gradesRef);

                  const batch = writeBatch(db);
                  gradesSnap.forEach(gradeDoc => {
                    batch.delete(gradeDoc.ref);
                  });
                  await batch.commit();

                  await deleteDoc(courseDoc.ref);
                }
                await deleteDoc(semesterDoc.ref);
              }

              const yearCoursesRef = collection(db, 'users', userId, 'studyPrograms', yearId, 'courses');
              const yearCoursesSnap = await getDocs(yearCoursesRef);
              const batch = writeBatch(db);
              yearCoursesSnap.forEach(courseDoc => {
                batch.delete(courseDoc.ref);
              });
              await batch.commit();

              await deleteDoc(yearRef);

              setYears(prev => prev.filter(p => p.id !== yearId));
            } catch (error) {
              Alert.alert("Error", "Failed to delete year. Please try again.");
            }
          }
        }
      ]
    );
  };

  const onYearPress = (yearId) => {
    navigation.navigate('SemesterSelectionScreen', { yearId });
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="menu" size={28} color={isDark ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Icon name="person-circle" size={28} color={isDark ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/*
        <View style={styles.section}>
          <LottieView
            ref={animationRef}
            source={require("../../assets/animations/graph-animation.json")}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        */}

        <View style={styles.section}>
          <DashboardCalendar
            selectedDate={selectedDate}
            onDayPress={onDayPress}
            isDark={isDark}
          />
        </View>

        <View style={styles.section}>
          
          {/* --- New Button to HowMuchdoINeed Screen --- */}
          <TouchableOpacity
            style={{
              backgroundColor: '#CA4B4B',
              paddingVertical: 16,
              borderRadius: 10,
              marginBottom: 18,
              alignItems: 'center',
              width: '90%',
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
            }}
            onPress={() => navigation.navigate('HowMuchDoINeed')}
            accessibilityLabel="Go to HowMuchdoINeed"
          >
            <Ionicons name="calculator-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              How Much Do I Need?
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.welcome}>{t('dashboard.yourClasses')}</Text>

          {loading ? (
            <Text style={styles.loadingText}>{t('dashboard.loading')}</Text>
          ) : years.length === 0 ? (
            <Text style={styles.noYears}>{t('dashboard.noYearsFound')}</Text>
          ) : (
            years.map((year) => (
              <TouchableOpacity
                key={year.id}
                style={styles.yearRowButton}
                onPress={() => onYearPress(year.id)}
                accessibilityLabel={`Open ${year.id} details`}
              >
                <Text style={styles.yearText}>{year.id}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteYear(year.id)}
                  style={styles.trashButton}
                  accessibilityLabel={`Delete ${year.id}`}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
