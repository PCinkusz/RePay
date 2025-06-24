import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment, HandedOverAmount } from '../types/Payment';
import { getCurrentDate, getCurrentTimestamp, generateId } from '../utils/dateUtils';

const PAYMENTS_KEY = 'payments';
const HANDED_OVER_KEY = 'handedOverAmounts';

export class StorageService {
  static async getPayments(): Promise<Payment[]> {
    try {
      const paymentsJson = await AsyncStorage.getItem(PAYMENTS_KEY);
      if (paymentsJson) {
        return JSON.parse(paymentsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading payments:', error);
      return [];
    }
  }

  static async savePayments(payments: Payment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
      throw error;
    }
  }

  static async addPayment(payment: Payment): Promise<void> {
    try {
      const payments = await this.getPayments();
      payments.push(payment);
      await this.savePayments(payments);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  static async addMultiplePayments(newPayments: Payment[]): Promise<void> {
    try {
      const existingPayments = await this.getPayments();
      const allPayments = [...existingPayments, ...newPayments];
      await this.savePayments(allPayments);
    } catch (error) {
      console.error('Error adding multiple payments:', error);
      throw error;
    }
  }

  static async updatePayment(updatedPayment: Payment): Promise<void> {
    try {
      const payments = await this.getPayments();
      const index = payments.findIndex(p => p.id === updatedPayment.id);
      if (index !== -1) {
        payments[index] = updatedPayment;
        await this.savePayments(payments);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  static async deletePayment(paymentId: string): Promise<void> {
    try {
      const payments = await this.getPayments();
      const filteredPayments = payments.filter(p => p.id !== paymentId);
      await this.savePayments(filteredPayments);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Handed Over Amount methods
  static async getHandedOverAmounts(): Promise<HandedOverAmount[]> {
    try {
      const handedOverJson = await AsyncStorage.getItem(HANDED_OVER_KEY);
      if (handedOverJson) {
        return JSON.parse(handedOverJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading handed over amounts:', error);
      return [];
    }
  }

  static async saveHandedOverAmounts(amounts: HandedOverAmount[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HANDED_OVER_KEY, JSON.stringify(amounts));
    } catch (error) {
      console.error('Error saving handed over amounts:', error);
      throw error;
    }
  }

  static async addHandedOverAmount(amount: HandedOverAmount): Promise<void> {
    try {
      const amounts = await this.getHandedOverAmounts();
      amounts.push(amount);
      await this.saveHandedOverAmounts(amounts);
    } catch (error) {
      console.error('Error adding handed over amount:', error);
      throw error;
    }
  }

  static async addMultipleHandedOverAmounts(newAmounts: HandedOverAmount[]): Promise<void> {
    try {
      const existingAmounts = await this.getHandedOverAmounts();
      const allAmounts = [...existingAmounts, ...newAmounts];
      await this.saveHandedOverAmounts(allAmounts);
    } catch (error) {
      console.error('Error adding multiple handed over amounts:', error);
      throw error;
    }
  }

  static async deleteHandedOverAmount(amountId: string): Promise<void> {
    try {
      const amounts = await this.getHandedOverAmounts();
      const filteredAmounts = amounts.filter(a => a.id !== amountId);
      await this.saveHandedOverAmounts(filteredAmounts);
    } catch (error) {
      console.error('Error deleting handed over amount:', error);
      throw error;
    }
  }

  static async getTotalHandedOver(): Promise<number> {
    try {
      const amounts = await this.getHandedOverAmounts();
      return amounts.reduce((sum, amount) => sum + amount.amount, 0);
    } catch (error) {
      console.error('Error calculating total handed over:', error);
      return 0;
    }
  }

  static async setTotalHandedOver(totalAmount: number): Promise<void> {
    try {
      // Clear all existing handed over amounts and set a single new one
      const handedOverAmount: HandedOverAmount = {
        id: generateId(),
        amount: totalAmount,
        date: getCurrentDate(),
        createdAt: getCurrentTimestamp(),
      };
      await this.saveHandedOverAmounts([handedOverAmount]);
    } catch (error) {
      console.error('Error setting total handed over:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PAYMENTS_KEY, HANDED_OVER_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  static async exportToJson(): Promise<string> {
    try {
      const payments = await this.getPayments();
      const handedOverAmounts = await this.getHandedOverAmounts();
      const data = {
        payments,
        handedOverAmounts,
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }
}
