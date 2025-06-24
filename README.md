# RePay - Payment Tracker

A React Native mobile application for tracking payments and managing repayment amounts. Built with Expo and TypeScript, featuring a modern Material Design interface.

## Features

- **Payment Management**: Add, edit, and delete payment records
- **Payment Details**: Track merchant, amount, date, and optional notes
- **Search & Filter**: Search payments by merchant name and sort by date, merchant, or amount
- **Repayment Tracking**: Monitor total handed-over amounts vs total payments
- **Data Export/Import**: Export payment data to JSON format for backup or sharing
- **Local Storage**: Secure local data persistence using AsyncStorage
- **Modern UI**: Material Design components with React Native Paper

## Technology Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **AsyncStorage** - Local data persistence

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For iOS development: Xcode
- For Android development: Android Studio

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PCinkusz/RePay
cd PaymentTracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on device/simulator:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
PaymentTracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── HandedOverSummary.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentItem.tsx
│   │   └── PaymentList.tsx
│   ├── screens/             # Screen components
│   │   ├── AddEditScreen.tsx
│   │   └── PaymentsScreen.tsx
│   ├── services/            # Business logic and data services
│   │   └── StorageService.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── navigation.ts
│   │   └── Payment.ts
│   └── utils/               # Utility functions
│       └── dateUtils.ts
├── assets/                  # Images and icons
├── App.tsx                  # Main app component
├── package.json
└── app.json                 # Expo configuration
```

## Key Components

### PaymentsScreen
- Main screen displaying payment list and summary
- Implements search, filtering, and sorting functionality
- Provides export/import capabilities

### AddEditScreen
- Form for adding new payments or editing existing ones
- Input validation and error handling
- Date picker and merchant/amount input fields

### StorageService
- Handles all data persistence operations
- Manages payments and handed-over amounts
- Provides export/import functionality

## Usage

1. **Add Payment**: Tap the "+" button to add a new payment record
2. **Edit Payment**: Tap on any payment item to edit its details
3. **Track Repayments**: Use the "Oddane" section to track handed-over amounts
4. **Search**: Use the search bar to find specific merchants
5. **Export Data**: Use the menu to export your data as JSON

## Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```
