import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ClothingDataDropdowns from '../UploadClothingComponents'; // Adjust the import path as necessary
import { DocumentSnapshot } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  DocumentSnapshot: jest.fn().mockImplementation(() => ({
    exists: jest.fn().mockReturnValue(true),
    data: jest.fn().mockReturnValue({
      name: 'Test Shirt',
      size: 'M',
      color: 'Blue',
      clothingType: 'T-Shirt',
      brand: 'Nike',
      note: 'This is a test note',
      wearCount: 2,
    }),
  })),
}));

describe('ClothingDataDropdowns Component', () => {
  const mockHandleSubmit = jest.fn();
  
  // Mock instance of DocumentSnapshot
  const mockDocSnapshot = new (require('firebase/firestore').DocumentSnapshot)();

  it('renders correctly with placeholder values from docSnapshot', () => {
    const { getByPlaceholderText } = render(
      <ClothingDataDropdowns handleSubmit={mockHandleSubmit} docSnapshot={mockDocSnapshot} />
    );

    // Test the initial placeholder values based on docSnapshot
    expect(getByPlaceholderText('Test Shirt')).toHaveProp('placeholder', 'Test Shirt');
    expect(screen.getByText('M')).toBeTruthy();  // Ensure 'M' is rendered as selected
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.getByText('T-Shirt')).toBeTruthy();
    expect(getByPlaceholderText('Nike')).toHaveProp('placeholder', 'Nike');
    expect(getByPlaceholderText('This is a test note')).toHaveProp('placeholder', 'This is a test note');
  });

  it('handles user input and form submission correctly', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ClothingDataDropdowns handleSubmit={mockHandleSubmit} docSnapshot={mockDocSnapshot} />
    );

    // Change text inputs
    const nameInput = getByPlaceholderText('Test Shirt');
    fireEvent.changeText(nameInput, 'New Shirt');
  
    const brandInput = getByPlaceholderText('Nike');
    fireEvent.changeText(brandInput, 'Adidas');
    // Submit the form
    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);

    // Assert handleSubmit was called with correct values
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        'New Shirt',
        'M',
        'Blue',
        'T-Shirt',
        'Adidas',
        'This is a test note'
      );
    });
  });

  // it('does not call handleSubmit if the form is incomplete', async () => {
  //   const { getByText } = render(
  //     <ClothingDataDropdowns handleSubmit={mockHandleSubmit} docSnapshot={mockDocSnapshot} />
  //   );

  //   const submitButton = getByText('Submit');
  //   fireEvent.press(submitButton);

  //   await waitFor(() => {
  //     // Ensure handleSubmit wasn't called with incomplete data
  //     expect(mockHandleSubmit).not.toHaveBeenCalled();
  //   });
  // });
});