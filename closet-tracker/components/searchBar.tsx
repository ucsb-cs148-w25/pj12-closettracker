import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
//import styles from '@/styles/searchBarStyles';

interface SearchBarProps {
  searchQuery: string;
  handleSearch: (query: string) => void;
  clearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, handleSearch, clearSearch }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput 
        placeholder='Search'
        placeholderTextColor={'#ccc'}
        clearButtonMode='never'
        style={styles.searchBox}
        autoCapitalize='none'
        autoCorrect={false}
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {searchQuery.length > 0 && (
        <Pressable onPress={clearSearch} style={styles.clearButton}>
          <IconSymbol name="xmark.circle" color="#ccc" size={20}/>
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
    searchContainer: {
        alignItems: 'center',
        marginBottom: 10,
      },
    searchBox: {
        paddingHorizontal:20,
        paddingVertical:10,
        borderColor:'#ccc',
        borderWidth:1,
        borderRadius:8,
        width:'95%',
    },
    clearButton: {
        position: 'absolute',
        right:10,
        padding:10,
    }
});