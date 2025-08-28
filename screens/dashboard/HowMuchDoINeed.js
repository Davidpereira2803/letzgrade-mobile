import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { requiredForTarget60 } from '../../utils/required60';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

function parseFraction(input) {
  if (!input) return NaN;
  if (input.includes('/')) {
    const [num, denom] = input.split('/').map(Number);
    if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
      return num / denom;
    }
    return NaN;
  }
  const val = Number(input);
  return isNaN(val) ? NaN : val;
}

export default function HowMuchDoINeed() {
  const [target, setTarget] = useState('30');
  const [rows, setRows] = useState([{ score: '40', weight: '30' }, { score: '20', weight: '30' }]);
  const [useFraction, setUseFraction] = useState(false);
  const { isDark } = useTheme();

  const styles = isDark ? darkStyles : lightStyles;

  const parsed = rows
    .map(r => ({
      score: Number(r.score || 0),
      weightPct: useFraction
        ? parseFraction(r.weight) * 100
        : Number(r.weight || 0)
    }))
    .filter(r => !Number.isNaN(r.score) && !Number.isNaN(r.weightPct));

  const res = useMemo(() => {
    if (!target) return null;
    return requiredForTarget60({ target: Number(target), entries: parsed });
  }, [target, parsed]);

  const handleDeleteRow = (index) => {
    const copy = [...rows];
    copy.splice(index, 1);
    setRows(copy);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How much do I need if… (0–60)</Text>

      {res && (
        <View style={styles.resultBox}>
          {res.ok ? (
            <>
              <Text style={styles.resultText}>
                Required on remaining <Text style={styles.resultHighlight}>{Math.round(res.remainingWeight * 100)}%</Text>:{" "}
                <Text style={styles.resultHighlight}>{res.required.toFixed(2)} / 60</Text>
              </Text>
              {res.reason === 'already_met' && <Text style={styles.success}>You've already met or exceeded the target.</Text>}
            </>
          ) : (
            <>
              {res.reason === 'no_weight_left' && <Text style={styles.error}>No weight left to improve the grade.</Text>}
              {res.reason === 'over_cap' && (
                <Text style={styles.error}>
                  Impossible: you’d need {res.required.toFixed(2)} which exceeds 60.
                </Text>
              )}
            </>
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target grade</Text>
          <TextInput
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
            placeholder="e.g. 30"
            style={styles.input}
            placeholderTextColor={isDark ? "#bbb" : "#888"}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Weight input:</Text>
            <Text style={[styles.label, { marginLeft: 8 }]}>{useFraction ? "Fraction (e.g. 1/2)" : "Percent (1–100%)"}</Text>
            <Switch
              value={useFraction}
              onValueChange={setUseFraction}
              thumbColor={isDark ? "#CA4B4B" : "#ccc"}
              trackColor={{ false: "#bbb", true: "#CA4B4B" }}
              style={{ marginLeft: 12 }}
            />
          </View>
        </View>

        <FlatList
          data={rows}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={item.score}
                onChangeText={v => {
                  const copy = [...rows]; copy[index].score = v; setRows(copy);
                }}
                placeholder="Score (0–60)"
                placeholderTextColor={isDark ? "#bbb" : "#888"}
              />
              <TextInput
                style={[styles.input, { width: 110, marginLeft: 8 }]}
                keyboardType={useFraction ? "default" : "numeric"}
                value={item.weight}
                onChangeText={v => {
                  const copy = [...rows]; copy[index].weight = v; setRows(copy);
                }}
                placeholder={useFraction ? "(e.g. 1/2)" : "Weight %"}
                placeholderTextColor={isDark ? "#bbb" : "#888"}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRow(index)}
                accessibilityLabel="Delete result"
              >
                <Ionicons name="trash" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <View style={{ marginTop: 8 }}>
              <Button title="Add another result" color="#CA4B4B" onPress={() => setRows([...rows, { score: '', weight: '' }])} />
            </View>
          }
        />
      </View>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#CA4B4B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 18,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CA4B4B',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#222',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#CA4B4B',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBox: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CA4B4B',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    marginHorizontal: 8,
    elevation: 2,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 17,
    color: '#222',
    textAlign: 'center',
  },
  resultHighlight: {
    fontWeight: '700',
    color: '#CA4B4B',
  },
  success: {
    color: '#2e7d32',
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: '#CA4B4B',
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#CA4B4B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 18,
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 12,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CA4B4B',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#CA4B4B',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBox: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CA4B4B',
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 10,
    marginHorizontal: 8,
    elevation: 2,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
  },
  resultHighlight: {
    fontWeight: '700',
    color: '#CA4B4B',
  },
  success: {
    color: '#81c784',
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: '#CA4B4B',
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
  },
});
