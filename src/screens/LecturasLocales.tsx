import React, {useContext, useEffect, useState} from 'react';
import {Text, View, StyleSheet, useWindowDimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

import {BaseScreen} from '../Template/BaseScreen';
import {ILectura} from '../interfaces/ApiInterface';
import {List} from '../components/List';
import {colores, iconos, styles} from '../theme/appTheme';
import {LoaderContext} from '../context/LoaderContext';
import {sleep} from '../helpers/sleep';
import {useRequest} from '../api/useRequest';
import {Endpoints} from '../../../Common/api/routes';
import {ButtonWithText} from '../components/ButtonWithText';
import {CheckInternetContext} from '../context/CheckInternetContext';
import {AlertContext} from '../context/AlertContext';


export const LecturasLocales = () => {
  const {postRequest} = useRequest();
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const {ShowAlert} = useContext(AlertContext);
  const {setIsLoading} = useContext(LoaderContext);
  const {hasConection} = useContext(CheckInternetContext);
  const [lecturasGuardadas, setLecturasGuardadas] = useState<ILectura[]>([]);

  useEffect(() => {
    // Cargar las lecturas guardadas en "LecturasLocal" al inicio del componente
    cargarLecturasGuardadas();
  }, []);

  useEffect(() => {
    // Verificar si tienes Id_Planta en cada lectura guardada
    const hasMissingIdPlanta = lecturasGuardadas.some(
      lectura => !lectura.Id_Planta,
    );

    if (hasMissingIdPlanta) {
      // Mostrar alerta de error
      ShowAlert('default', {
        title: 'Error',
        message: 'No se proporcionaron los datos necesarios.',
      });

      // Hacer un goBack
      navigation.goBack();
    }
  }, [lecturasGuardadas]);

  const cargarLecturasGuardadas = async () => {
    try {
      const lecturasExistentes = await AsyncStorage.getItem('LecturasLocal');
      console.log({lecturasExistentes})
      if (lecturasExistentes) {
        const lecturasExistentesArray: ILectura[] = JSON.parse(lecturasExistentes);
        setLecturasGuardadas(lecturasExistentesArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const Catalogos = async () => {
    setIsLoading(true);
    cargarLecturasGuardadas();
    await sleep(2);
    setIsLoading(false);
  };

  const renderLecturas = (lectura: ILectura) => {
    // Itera a través de las propiedades del objeto ILectura y muestra sus valores
    return (
      <View style={{...lecturasStyles.rutaContainer, width: width * 0.8}}>
        <View key={lectura.Id_Planta} style={{flexDirection: 'column'}}>
          <View
            style={{
              alignItems: 'flex-end',
              width: width * 0.65,
            }}>
            <Text style={lecturasStyles.routeCod}>{lectura.planta}</Text>
          </View>
          <Text style={lectura.Observacion!=""?lecturasStyles.route:lecturasStyles.routeEmpty}>{lectura.Observacion!=""?lectura.Observacion:"No hay observación"}</Text>
        </View>
      </View>
    );
  };
  const enviarLecturasAlServidor = async (lecturas: ILectura[]) => {
    try {
      for (const lectura of lecturas) {
        // Hacer la solicitud al servidor para guardar la lectura
        await postRequest(Endpoints.Lectura, lectura)
          .then(async () => {
            const lecturasExistentes =
              await AsyncStorage.getItem('LecturasLocal');
            if (lecturasExistentes) {
              const lecturasExistentesArray: ILectura[] =
                JSON.parse(lecturasExistentes);
              // Encuentra y elimina la lectura que coincida con la lectura enviada
              const lecturasActualizadas = lecturasExistentesArray.filter(
                lect => lect.SyncId !== lectura.SyncId,
              );
              await AsyncStorage.setItem(
                'LecturasLocal',
                JSON.stringify(lecturasActualizadas),
              );
              setLecturasGuardadas(lecturasActualizadas);
            }
          })
          .catch(e => {
            console.log('error', JSON.stringify(e));
          });
      }
    } catch (error) {
      console.error('Error al enviar las lecturas al servidor:', error);
    }
  };

  return (
    <BaseScreen isScroll={true}>
      <ButtonWithText
        icon={iconos.sincronizar}
        onPress={() => enviarLecturasAlServidor(lecturasGuardadas)}
        title="Sincronizar"
        disabled={!hasConection}
      />
      <List
        data={lecturasGuardadas}
        refreshFunction={() => Catalogos()}
        renderItem={renderLecturas}
        ListEmptyText="No hay lecturas por visualizar"
      />
    </BaseScreen>
  );
};

const lecturasStyles = StyleSheet.create({
  rutaContainer: {
    height: '90%',
    flex: 1,
    //...styles.sombra,
    marginBottom: 10,
    backgroundColor: colores.LocationBg ,
    borderRadius:10,
  },
  route: {
    fontSize: 16,
    marginBottom: 4,
    marginHorizontal: 5,
    marginLeft:20,
    padding:5,
    color: colores.negro,
  },
  routeEmpty: {
    fontSize: 11,
    marginBottom: 4,
    marginHorizontal: 5,
    marginLeft:20,
    padding:5,
    color: colores.negroClaro,
    fontStyle:"italic",
  },
  routeCod: {
    fontSize: 16,
    fontWeight:"bold",
    marginBottom: 4,
    color: colores.primario,
    marginTop:5,
  },
});
