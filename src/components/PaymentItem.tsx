import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, Animated, PanResponder, TouchableWithoutFeedback } from 'react-native';
import { Card, Text, Chip, Icon } from 'react-native-paper';
import { Payment } from '../types/Payment';
import { formatDate } from '../utils/dateUtils';

interface PaymentItemProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentItemComponent: React.FC<PaymentItemProps> = ({
  payment,
  onEdit,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteBackgroundOpacity = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);




  const handleDelete = useCallback(() => {
    Alert.alert(
      'Usuń płatność',
      `Czy na pewno chcesz usunąć płatność do ${payment.merchant}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => onDelete(payment.id)
        },
      ]
    );
  }, [payment.merchant, payment.id, onDelete]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) { // Only allow left swipe
        translateX.setValue(gestureState.dx);
        // Show delete background based on swipe distance
        const opacity = Math.min(Math.abs(gestureState.dx) / 100, 1);
        deleteBackgroundOpacity.setValue(opacity);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -100) { // Swipe threshold
        handleDelete();
      }
      // Reset position and hide delete background
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(deleteBackgroundOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    },
  });

  const handlePressIn = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onEdit(payment);
    }, 500); // 500ms long press
  }, [onEdit, payment]);

  const handlePressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Delete background */}
      <Animated.View
        style={[
          styles.deleteBackground,
          { opacity: deleteBackgroundOpacity }
        ]}
      >
        <View style={styles.deleteContent}>
          <Icon source="delete" size={24} color="#fff" />
          <Text variant="bodyMedium" style={styles.deleteText}>
            Usuń
          </Text>
        </View>
      </Animated.View>

      {/* Payment card */}
      <Animated.View
        style={[styles.cardContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.cardContainer}>
            <Card style={styles.card}>
              <Card.Content>
              <View style={styles.header}>
                <View style={styles.merchantInfo}>
                  <Text variant="titleMedium" style={styles.merchant}>
                    {payment.merchant}
                  </Text>
                  <Text variant="bodySmall" style={styles.date}>
                    {formatDate(payment.date)}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Chip mode="outlined" style={styles.priceChip}>
                    {payment.price.toFixed(2)} zł
                  </Chip>
                </View>
              </View>
              {payment.notes && (
                <Text variant="bodySmall" style={styles.notes}>
                  {payment.notes}
                </Text>
              )}
            </Card.Content>
          </Card>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PaymentItem = React.memo(PaymentItemComponent, (prevProps, nextProps) => {
  // Only re-render if the payment data has actually changed
  return (
    prevProps.payment.id === nextProps.payment.id &&
    prevProps.payment.merchant === nextProps.payment.merchant &&
    prevProps.payment.price === nextProps.payment.price &&
    prevProps.payment.date === nextProps.payment.date &&
    prevProps.payment.notes === nextProps.payment.notes &&
    prevProps.payment.updatedAt === nextProps.payment.updatedAt
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f44336',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContainer: {
    backgroundColor: 'transparent',
  },
  card: {
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantInfo: {
    flex: 1,
  },
  merchant: {
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChip: {
    marginRight: 8,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});
