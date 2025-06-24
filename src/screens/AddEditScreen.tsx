import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Payment } from '../types/Payment';
import { RootStackParamList } from '../types/navigation';
import { StorageService } from '../services/StorageService';
import { PaymentForm } from '../components/PaymentForm';

type AddEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEdit'>;
type AddEditScreenRouteProp = RouteProp<RootStackParamList, 'AddEdit'>;

interface AddEditScreenProps {
  navigation: AddEditScreenNavigationProp;
  route: AddEditScreenRouteProp;
}

export const AddEditScreen: React.FC<AddEditScreenProps> = ({
  navigation,
  route,
}) => {
  const { mode, payment } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (paymentData: Payment) => {
    setLoading(true);
    try {
      if (mode === 'add') {
        await StorageService.addPayment(paymentData);
      } else {
        await StorageService.updatePayment(paymentData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać płatności');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={mode === 'add' ? 'Dodaj płatność' : 'Edytuj płatność'} />
      </Appbar.Header>

      <PaymentForm
        payment={payment}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
