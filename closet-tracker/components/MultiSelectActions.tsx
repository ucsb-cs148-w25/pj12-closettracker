import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
//import styles from '@/styles';

interface MultiSelectActionsProps {
  selectedIds: string[];
  handleCancelSelection: () => void;
  showCancel?: boolean;
  handleAddOutfit: () => void;
  showAddOutfit?: boolean;
  handleEdit: () => void;
  showEdit?: boolean;
  handleDeleteSelected: () => void;
  showDelete?: boolean;
}

export const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({
  selectedIds,
  handleCancelSelection,
  showCancel = true,
  handleAddOutfit,
  showAddOutfit = true,
  handleEdit,
  showEdit = true,
  handleDeleteSelected,
  showDelete = true
}) => {
  return (
    <View style={styles.iconContainer}>
      {showCancel ? (<Pressable onPress={handleCancelSelection}>
        <IconSymbol name="xmark.app" color="gray" size={28} />
      </Pressable>): <View/>}

      {showAddOutfit && (<Pressable onPress={handleAddOutfit}>
        <IconSymbol name="pencil.and.list.clipboard" color="green" size={28} />
      </Pressable>)}

      {showEdit && selectedIds.length === 1 && (
        <Pressable onPress={handleEdit}>
          <IconSymbol name="pencil" color="gray" size={28} />
        </Pressable>
      )}

      {showDelete && handleDeleteSelected && (
        <View style={styles.deleteIconWrapper}>
          <Pressable onPress={handleDeleteSelected}>
            <IconSymbol name="trash" color="red" size={28} />
            {selectedIds.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedIds.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  deleteIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
});