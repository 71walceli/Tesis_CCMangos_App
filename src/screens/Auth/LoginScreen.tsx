import React, {useContext} from 'react';
import DeviceInfo from 'react-native-device-info';
import Config from "react-native-config"

import {View, Keyboard, Text, Image, StyleSheet} from 'react-native';
import {colores} from '../../theme/appTheme';
import {AuthContext} from '../../context/AuthContext';
import {useForm} from '../../hooks/useForm';
import {ButtonWithText} from '../../components/ButtonWithText';
import {InputForm} from '../../components/InputForm';
import {BaseScreen} from '../../Template/BaseScreen';
import {useNavigation} from '@react-navigation/native';


export const LoginScreen = () => {
  const {signIn} = useContext(AuthContext);
  const navigation = useNavigation();

  const {email, password, onChange} = useForm({
    email: Config.DEFAULT_USERNAME,
    password: Config.DEFAULT_PASSWORD,
  });

  const Login = () => {
    Keyboard.dismiss();
    signIn({correo: email, password});
  };

  return (
    <BaseScreen>
      <Image
        source={require('../../assets/logoUAE.png')}
        style={{
          height: '30%',
          width: '80%',
          resizeMode: 'contain',
          alignSelf: 'center',
        }}></Image>
      <Text
        style={{
          color: colores.plomo,
          marginBottom: '15%',
          fontSize: 30,
          textAlign: 'center',
        }}>
        INICIAR SESIÓN
      </Text>
      <InputForm
        placeholder={'Usuario'}
        value={email}
        keyboard={'email-address'}
        onChange={value => onChange(value, 'email')}></InputForm>
      <InputForm
        placeholder={'Contraseña'}
        securetextentry={true}
        value={password}
        onChange={value => onChange(value, 'password')}></InputForm>
      <ButtonWithText
        onPress={() => Login()}
        title={'INICIAR'}
        icon="rocket"></ButtonWithText>
      <View
        style={{
          alignSelf: 'flex-end',
          alignItems: 'flex-end',
        }}>
        {/* <TextButton
          title={'Recuperar cuenta'}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate('RecoveryPasswordScreen'),
            )
          }></TextButton> */}
      </View>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          Versión: {DeviceInfo.getVersion()}
        </Text>
      </View>
    </BaseScreen>
  );
};
const styles = StyleSheet.create({
  versionContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'white',
    borderColor: '',
    borderWidth: 0,
    borderTopLeftRadius: 10,
    alignItems: 'flex-end',
    flex: 1, // Add flex: 1 to ensure it sticks to the bottom
  },
  versionText: {
    color: '#72b01d',
    fontWeight: 'bold',
  },
});
