import React, {} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import {colores} from '../theme/appTheme';


interface Props<T extends unknown> {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
}

export const SearchInput = <T extends unknown>({
  value, onChange, placeholder, 
}: Props<T>) => {

  return (
    <View style={styles.textBackground}>
      <TextInput
        placeholder={"Buscar Lotes y áreas"}
        placeholderTextColor={colores.plomo}
        style={{
          ...styles.textInput,
          top: Platform.OS === 'ios' ? 0 : 2,
          color: 'black',
        }}
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChange}
      />
      <Icon name="search-outline" color="grey" size={25} />
    </View>
  );
};

const styles = StyleSheet.create({
  textBackground: {
    backgroundColor: colores.plomoclaro,
    borderRadius: 50,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    fontSize: 16,
    width: '90%',
  },
});
