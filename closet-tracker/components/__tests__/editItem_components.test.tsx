import React from 'react';
import { render, screen } from '@testing-library/react-native';
import EditItem from '@/app/(app)/(screens)/editItem';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: jest.fn(() => true),
    data: jest.fn(() => ({
      itemName: "dont exist",
      image: "dont exist",
    })),
  }),
  getFirestore: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('@/FirebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'dont exist' },
  },
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    item_id: 'dont exist',
    collections: 'clothing',
  }),
}));

describe('EditItem Component', () => {
  it('renders without crashing', () => {
    render(<EditItem />);
    // screen.debug();
    expect(true).toBe(true);
  });
  it('contains expected UI placeholder elements', () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(<EditItem />);
    
    // Check for labels
    expect(getByText('Name:')).toBeTruthy();
    expect(getByText('Select Size:')).toBeTruthy();
    expect(getByText('Select Color:')).toBeTruthy();
    expect(getByText('Select Clothing Type:')).toBeTruthy();
    expect(getByText('Brand:')).toBeTruthy();
    expect(getByText('Notes:')).toBeTruthy();
    expect(getByText('Submit')).toBeTruthy();

    // Check for placeholders
    expect(getByPlaceholderText('Set name')).toBeTruthy();
    expect(getByPlaceholderText('Add brand')).toBeTruthy();
    expect(getByPlaceholderText('Add note')).toBeTruthy();

    // Check for dropdowns (assuming text placeholders for selections)
    expect(getAllByText('Select size').length).toBeGreaterThan(0);
    expect(getAllByText('Select color').length).toBeGreaterThan(0);
    expect(getAllByText('Select clothing type').length).toBeGreaterThan(0);
  });
});
