import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Payment, PaymentFormData } from '../types/Payment';
import { getCurrentDate, getCurrentTimestamp, generateId } from '../utils/dateUtils';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (payment: Payment) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    merchant: '',
    price: '',
    notes: '',
  });
  const [date, setDate] = useState(getCurrentDate());
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  useEffect(() => {
    if (payment) {
      setFormData({
        merchant: payment.merchant,
        price: payment.price.toString(),
        notes: payment.notes || '',
      });
      setDate(payment.date);
    }
  }, [payment]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.merchant.trim()) {
      newErrors.merchant = 'Sklep jest wymagany';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Cena jest wymagana';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Wprowadź prawidłową cenę';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = getCurrentTimestamp();
    const paymentData: Payment = {
      id: payment?.id || generateId(),
      date,
      merchant: formData.merchant.trim(),
      price: parseFloat(formData.price),
      notes: formData.notes?.trim() || undefined,
      createdAt: payment?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(paymentData);
    Keyboard.dismiss(); // Dismiss after action
  };

  const handleCancel = () => {
    onCancel();
    Keyboard.dismiss(); // Dismiss after action
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.form}>
        <TextInput
          label="Sklep *"
          value={formData.merchant}
          onChangeText={(text) => setFormData({ ...formData, merchant: text })}
          error={!!errors.merchant}
          style={styles.input}
          mode="outlined"
        />
        {errors.merchant && (
          <Text style={styles.errorText}>{errors.merchant}</Text>
        )}

        <TextInput
          label="Cena *"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          keyboardType="decimal-pad"
          error={!!errors.price}
          style={styles.input}
          mode="outlined"
          right={<TextInput.Affix text="zł" />}
        />
        {errors.price && (
          <Text style={styles.errorText}>{errors.price}</Text>
        )}

        <TextInput
          label="Data"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="calendar" />}
        />

        <TextInput
          label="Notatki (opcjonalne)"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {payment ? 'Zaktualizuj' : 'Dodaj'} płatność
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
