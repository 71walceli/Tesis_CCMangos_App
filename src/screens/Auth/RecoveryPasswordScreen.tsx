import React, {useState} from 'react';
import {BaseScreen} from '../../Template/BaseScreen';
import {Text, View} from 'react-native';
import {colores} from '../../theme/appTheme';
import {Input} from '../../components/Input';
import {ButtonWithText} from '../../components/ButtonWithText';

export const RecoveryPasswordScreen = () => {
  const [email, setemail] = useState('');
  return (
    <BaseScreen style={{justifyContent: 'center'}}>
      <Text
        style={{
          color: colores.plomo,
          fontSize: 20,
          marginBottom: '5%',
          maxWidth: 350,
          textAlign: 'justify',
        }}>
        Ingrese su correo electrónico, para poder generar una nueva contraseña
      </Text>
      <Input
        placeholder={'Correo Electrónico'}
        value={email}
        keyboard={'email-address'}
        //color={colores.plomo}
        onChange={value => setemail(value)}></Input>
      <View style={{height: 20, width: '100%'}}></View>
      <ButtonWithText
        // TODO Dirigir a página Web respectiva
        onPress={() => {}}
        title={'RECUPERAR CUENTA'}></ButtonWithText>
    </BaseScreen>
  );
};
