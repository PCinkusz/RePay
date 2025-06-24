import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { PaymentsScreen } from './src/screens/PaymentsScreen';
import { AddEditScreen } from './src/screens/AddEditScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Payments"
          screenOptions={{
            headerShown: false, // We'll use custom headers in each screen
          }}
        >
          <Stack.Screen name="Payments" component={PaymentsScreen} />
          <Stack.Screen name="AddEdit" component={AddEditScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}
