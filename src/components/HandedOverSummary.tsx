import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { Card, Text, Button, TextInput, Chip } from 'react-native-paper';
import { HandedOverAmount } from '../types/Payment';
import { getCurrentDate, getCurrentTimestamp, generateId } from '../utils/dateUtils';

interface HandedOverSummaryProps {
  totalPayments: number;
  totalHandedOver: number;
  onAddHandedOver: (amount: HandedOverAmount) => void;
  onSetTotalHandedOver: (totalAmount: number) => void;
}

export const HandedOverSummary: React.FC<HandedOverSummaryProps> = ({
  totalPayments,
  totalHandedOver,
  onAddHandedOver,
  onSetTotalHandedOver,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editTotalAmount, setEditTotalAmount] = useState('');




  const remainingAmount = totalPayments - totalHandedOver;

  const handleAddAmount = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Błąd', 'Wprowadź prawidłową kwotę');
      return;
    }

    const handedOverAmount: HandedOverAmount = {
      id: generateId(),
      amount,
      date: getCurrentDate(),
      createdAt: getCurrentTimestamp(),
    };

    onAddHandedOver(handedOverAmount);
    setNewAmount('');
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewAmount('');
    setShowAddForm(false);
  };

  const handleLongPressHandedOver = () => {
    setEditTotalAmount(totalHandedOver.toString());
    setIsEditingTotal(true);
  };

  const handleSaveEditTotal = () => {
    const amount = parseFloat(editTotalAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Błąd', 'Wprowadź prawidłową kwotę');
      return;
    }

    onSetTotalHandedOver(amount);
    setIsEditingTotal(false);
    setEditTotalAmount('');
  };

  const handleCancelEditTotal = () => {
    setIsEditingTotal(false);
    setEditTotalAmount('');
  };



  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Podsumowanie
        </Text>
        
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Suma wydatków:</Text>
          <Chip mode="outlined" style={styles.chip}>
            {totalPayments.toFixed(2)} zł
          </Chip>
        </View>

        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Oddane:</Text>
          {isEditingTotal ? (
            <View style={styles.editTotalContainer}>
              <TextInput
                value={editTotalAmount}
                onChangeText={setEditTotalAmount}
                keyboardType="decimal-pad"
                style={styles.editTotalInput}
                mode="outlined"
                dense
                right={<TextInput.Affix text="zł" />}
              />
              <View style={styles.editTotalButtons}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEditTotal}
                  style={styles.editButton}
                  compact
                >
                  Anuluj
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveEditTotal}
                  style={styles.editButton}
                  compact
                >
                  Zapisz
                </Button>
              </View>
            </View>
          ) : (
            <Pressable onLongPress={handleLongPressHandedOver}>
              <Chip mode="outlined" style={styles.chip}>
                {totalHandedOver.toFixed(2)} zł
              </Chip>
            </Pressable>
          )}
        </View>

        <View style={styles.remainingRow}>
          <Text variant="titleLarge" style={styles.remainingLabel}>
            Do oddania:
          </Text>
          <View style={styles.remainingAmountContainer}>
            <Text variant="headlineMedium" style={styles.remainingAmount}>
              {remainingAmount.toFixed(2)} zł
            </Text>
          </View>
        </View>

        {!showAddForm ? (
          <Button
            mode="contained"
            onPress={() => setShowAddForm(true)}
            style={styles.addButton}
            icon="plus"
          >
            Dodaj oddaną kwotę
          </Button>
        ) : (
          <View style={styles.addForm}>
            <TextInput
              label="Oddana kwota"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="decimal-pad"
              style={styles.input}
              mode="outlined"
              right={<TextInput.Affix text="zł" />}
            />
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.button}
              >
                Anuluj
              </Button>
              <Button
                mode="contained"
                onPress={handleAddAmount}
                style={styles.button}
              >
                Dodaj
              </Button>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chip: {
    minWidth: 80,
  },
  remainingRow: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4caf50',
    elevation: 3,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  remainingLabel: {
    fontWeight: 'bold',
    color: '#2e7d32',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  remainingAmountContainer: {
    alignItems: 'center',
  },
  remainingAmount: {
    fontWeight: 'bold',
    color: '#1b5e20',
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(27, 94, 32, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  addForm: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  editTotalContainer: {
    flex: 1,
    marginLeft: 12,
  },
  editTotalInput: {
    marginBottom: 8,
  },
  editTotalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  editButton: {
    flex: 1,
  },
});
