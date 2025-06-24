import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { FAB, Appbar, Menu, Button, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Payment, HandedOverAmount } from '../types/Payment';
import { RootStackParamList } from '../types/navigation';
import { StorageService } from '../services/StorageService';
import { PaymentList } from '../components/PaymentList';
import { HandedOverSummary } from '../components/HandedOverSummary';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

type PaymentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payments'>;

interface PaymentsScreenProps {
  navigation: PaymentsScreenNavigationProp;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalHandedOver, setTotalHandedOver] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentView, setCurrentView] = useState('payments');

  const loadData = async () => {
    try {
      const loadedPayments = await StorageService.getPayments();
      const handedOverTotal = await StorageService.getTotalHandedOver();
      setPayments(loadedPayments);
      setTotalHandedOver(handedOverTotal);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Błąd', 'Nie udało się załadować danych');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddPayment = () => {
    navigation.navigate('AddEdit', { mode: 'add' });
  };

  const handleEditPayment = (payment: Payment) => {
    navigation.navigate('AddEdit', { mode: 'edit', payment });
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await StorageService.deletePayment(paymentId);
      await loadData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      Alert.alert('Błąd', 'Nie udało się usunąć płatności');
    }
  };

  const handleAddHandedOver = async (amount: HandedOverAmount) => {
    try {
      await StorageService.addHandedOverAmount(amount);
      await loadData();
    } catch (error) {
      console.error('Error adding handed over amount:', error);
      Alert.alert('Błąd', 'Nie udało się dodać oddanej kwoty');
    }
  };

  const handleSetTotalHandedOver = async (totalAmount: number) => {
    try {
      await StorageService.setTotalHandedOver(totalAmount);
      await loadData();
    } catch (error) {
      console.error('Error setting total handed over amount:', error);
      Alert.alert('Błąd', 'Nie udało się zaktualizować oddanej kwoty');
    }
  };

  const handleExportData = async () => {
    try {
      const jsonData = await StorageService.exportToJson();
      const fileName = `repay_eksport_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Eksport zakończony', `Dane wyeksportowane do ${fileName}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych');
    }
    setMenuVisible(false);
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const importedData = JSON.parse(fileContent);

        // Validate the imported data structure
        if (importedData.payments && Array.isArray(importedData.payments)) {
          const paymentsCount = importedData.payments.length;
          const handedOverCount = importedData.handedOverAmounts ? importedData.handedOverAmounts.length : 0;

          Alert.alert(
            'Importuj dane',
            `Czy na pewno chcesz zaimportować ${paymentsCount} płatności${handedOverCount > 0 ? ` i ${handedOverCount} oddanych kwot` : ''}? Zostaną one dodane do istniejących danych.`,
            [
              { text: 'Anuluj', style: 'cancel' },
              {
                text: 'Importuj',
                onPress: async () => {
                  try {
                    // Add imported payments to existing ones
                    if (importedData.payments && importedData.payments.length > 0) {
                      await StorageService.addMultiplePayments(importedData.payments);
                    }

                    // Add imported handed over amounts to existing ones
                    if (importedData.handedOverAmounts && importedData.handedOverAmounts.length > 0) {
                      await StorageService.addMultipleHandedOverAmounts(importedData.handedOverAmounts);
                    }

                    await loadData();
                    Alert.alert('Sukces', `Zaimportowano ${paymentsCount} płatności${handedOverCount > 0 ? ` i ${handedOverCount} oddanych kwot` : ''}`);
                  } catch (error) {
                    console.error('Error importing data:', error);
                    Alert.alert('Błąd', 'Nie udało się zaimportować danych');
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert('Błąd', 'Nieprawidłowy format pliku');
        }
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Błąd', 'Nie udało się zaimportować danych');
    }
    setMenuVisible(false);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Wyczyść wszystkie dane',
      'Czy na pewno chcesz usunąć wszystkie płatności i oddane kwoty? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyczyść wszystko',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              setPayments([]);
              setTotalHandedOver(0);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Błąd', 'Nie udało się wyczyścić danych');
            }
          },
        },
      ]
    );
    setMenuVisible(false);
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.price, 0);

  if (loading) {
    return <View style={styles.container} />;
  }

  const renderContent = () => {
    if (currentView === 'summary') {
      return (
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <HandedOverSummary
            totalPayments={totalPayments}
            totalHandedOver={totalHandedOver}
            onAddHandedOver={handleAddHandedOver}
            onSetTotalHandedOver={handleSetTotalHandedOver}
          />
        </ScrollView>
      );
    }

    return (
      <PaymentList
        payments={payments}
        totalHandedOver={totalHandedOver}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        onAddHandedOver={handleAddHandedOver}
        onSetTotalHandedOver={handleSetTotalHandedOver}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showSummary={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="RePay" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleExportData}
            title="Eksportuj dane"
            leadingIcon="export"
          />
          <Menu.Item
            onPress={handleImportData}
            title="Importuj dane"
            leadingIcon="import"
          />
          <Menu.Item
            onPress={handleClearAllData}
            title="Wyczyść wszystkie dane"
            leadingIcon="delete-sweep"
          />
        </Menu>
      </Appbar.Header>

      {renderContent()}

      <View style={styles.bottomNavigation}>
        <SegmentedButtons
          value={currentView}
          onValueChange={setCurrentView}
          buttons={[
            {
              value: 'payments',
              label: 'Płatności',
              icon: 'credit-card',
            },
            {
              value: 'summary',
              label: 'Podsumowanie',
              icon: 'chart-line',
            },
          ]}
          style={styles.segmentedButtons}
        />

        {currentView === 'payments' && (
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={handleAddPayment}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  bottomNavigation: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
