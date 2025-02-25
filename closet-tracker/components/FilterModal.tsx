import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function FilterModal({
  setFilters,
  filters,
  originalFilters,
  setFilterModalVisible,
  sortedAvailableSizes,
  availableColors,
  availableClothingTypes,
}: {
  setFilters: React.Dispatch<React.SetStateAction<{
    size: string | null;
    color: string | null;
    clothingType: string | null;
    brand: string;
    notes: string;
  }>>;
  filters: {
    size: string | null;
    color: string | null;
    clothingType: string | null;
    brand: string;
    notes: string;
  };
  originalFilters: {
    size: string | null;
    color: string | null;
    clothingType: string | null;
    brand: string;
    notes: string;
  };
  setFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sortedAvailableSizes: string[];
  availableColors: string[];
  availableClothingTypes: string[];
}) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filter Options</Text>
        <Pressable 
          onPress={() => {
            // cancel filtering – revert to the original filters
            setFilters(originalFilters);
            setFilterModalVisible(false);
          }} 
          style={styles.exitButtonModal}
        >
          <IconSymbol name="xmark.circle" color="#ccc" size={28} />
        </Pressable>

        <Text style={styles.filterLabel}>Size</Text>
        <View style={styles.filterGroup}>
          {sortedAvailableSizes.map((size) => (
            <Pressable
              key={size}
              style={[
                styles.filterOption,
                filters.size === size && styles.selectedOption,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  size: filters.size === size ? null : size,
                })
              }
            >
              <Text style={styles.filterOptionText}>{size.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterLabel}>Color</Text>
        <View style={styles.filterGroup}>
          {availableColors.map((color) => (
            <Pressable
              key={color}
              style={[
                styles.filterOption,
                filters.color === color && styles.selectedOption,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  color: filters.color === color ? null : color,
                })
              }
            >
              <Text style={styles.filterOptionText}>{color}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterLabel}>Clothing Type</Text>
        <View style={styles.filterGroup}>
          {availableClothingTypes.map((type) => (
            <Pressable
              key={type}
              style={[
                styles.filterOption,
                filters.clothingType === type && styles.selectedOption,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  clothingType: filters.clothingType === type ? null : type,
                })
              }
            >
              <Text style={styles.filterOptionText}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterLabel}>Brand</Text>
        <TextInput
          placeholder="Enter brand"
          placeholderTextColor="#ccc"
          style={styles.filterTextInput}
          value={filters.brand}
          onChangeText={(text) => setFilters({ ...filters, brand: text })}
        />

        <Text style={styles.filterLabel}>Notes</Text>
        <TextInput
          placeholder="Enter notes"
          placeholderTextColor="#ccc"
          style={styles.filterTextInput}
          value={filters.notes}
          onChangeText={(text) => setFilters({ ...filters, notes: text })}
        />

        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity style={styles.applyButton} onPress={() => setFilterModalVisible(false)}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButtonModal}
            onPress={() =>
              {
                setFilters({
                  size: null,
                  color: null,
                  clothingType: null,
                  brand: '',
                  notes: '',
                });
                setFilterModalVisible(false)
              }
            }
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exitButtonModal: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  filterLabel: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  filterOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: '#4160fb',
    borderColor: '#4160fb',
  },
  filterOptionText: {
    color: '#000',
  },
  filterTextInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: '#4160fb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButtonModal: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});