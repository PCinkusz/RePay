import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Menu, Button, Text, Chip } from 'react-native-paper';
import { Payment, PaymentFilters, HandedOverAmount } from '../types/Payment';
import { PaymentItem } from './PaymentItem';
import { HandedOverSummary } from './HandedOverSummary';

interface PaymentListProps {
  payments: Payment[];
  totalHandedOver: number;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
  onAddHandedOver: (amount: HandedOverAmount) => void;
  onSetTotalHandedOver: (totalAmount: number) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  showSummary?: boolean;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  totalHandedOver,
  onEdit,
  onDelete,
  onAddHandedOver,
  onSetTotalHandedOver,
  refreshing = false,
  onRefresh,
  showSummary = true,
}) => {
  const [filters, setFilters] = useState<PaymentFilters>({
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments;

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = payments.filter(
        (payment) =>
          payment.merchant.toLowerCase().includes(query) ||
          payment.notes?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [payments, filters]);

  const totalAmount = useMemo(() => {
    return filteredAndSortedPayments.reduce((sum, payment) => sum + payment.price, 0);
  }, [filteredAndSortedPayments]);

  const getSortLabel = useMemo(() => {
    const sortLabels = {
      date: 'Data',
      merchant: 'Sklep',
      price: 'Cena',
    };
    const orderLabel = filters.sortOrder === 'asc' ? '↑' : '↓';
    return `${sortLabels[filters.sortBy]} ${orderLabel}`;
  }, [filters.sortBy, filters.sortOrder]);

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const setSortBy = (sortBy: PaymentFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setMenuVisible(false);
  };

  const keyExtractor = useCallback((item: Payment) => item.id, []);

  const renderPaymentItem = useCallback(({ item }: { item: Payment }) => (
    <PaymentItem
      payment={item}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ), [onEdit, onDelete]);

  const renderSearchHeader = useCallback(() => (
    <View style={styles.searchHeader}>
      <Searchbar
        placeholder="Szukaj płatności..."
        onChangeText={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
        value={filters.searchQuery}
        style={styles.searchbar}
      />
    </View>
  ), [filters.searchQuery]);

  const renderSummaryHeader = useCallback(() => {
    if (!showSummary) return null;
    return (
      <HandedOverSummary
        totalPayments={totalAmount}
        totalHandedOver={totalHandedOver}
        onAddHandedOver={onAddHandedOver}
        onSetTotalHandedOver={onSetTotalHandedOver}
      />
    );
  }, [showSummary, totalAmount, totalHandedOver, onAddHandedOver, onSetTotalHandedOver]);

  const renderControlsHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.controls}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="sort"
              compact
            >
              Sortuj
            </Button>
          }
        >
          <Menu.Item onPress={() => setSortBy('date')} title="Data" />
          <Menu.Item onPress={() => setSortBy('merchant')} title="Sklep" />
          <Menu.Item onPress={() => setSortBy('price')} title="Cena" />
        </Menu>

        <Button
          mode="outlined"
          onPress={toggleSortOrder}
          compact
        >
          {getSortLabel}
        </Button>
      </View>

      <View style={styles.summary}>
        <Text variant="bodyMedium">
          {filteredAndSortedPayments.length} płatnoś{filteredAndSortedPayments.length === 1 ? 'ć' : 'ci'}
        </Text>
        <Chip mode="outlined">
          Suma: {totalAmount.toFixed(2)} zł
        </Chip>
      </View>
    </View>
  ), [menuVisible, filteredAndSortedPayments.length, totalAmount, setSortBy, toggleSortOrder, getSortLabel]);

  const renderListHeader = useCallback(() => (
    <View>
      {renderSummaryHeader()}
      {renderControlsHeader()}
    </View>
  ), [renderSummaryHeader, renderControlsHeader]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {filters.searchQuery ? 'Nie znaleziono płatności pasujących do wyszukiwania.' : 'Brak płatności. Dodaj swoją pierwszą płatność!'}
      </Text>
    </View>
  ), [filters.searchQuery]);

  return (
    <View style={styles.container}>
      {renderSearchHeader()}
      <FlatList
        data={filteredAndSortedPayments}
        renderItem={renderPaymentItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="never"
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={100}
        initialNumToRender={15}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
  },
  searchHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    marginBottom: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

