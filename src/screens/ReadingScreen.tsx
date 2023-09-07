import React, {useContext, useEffect, useState} from 'react';
import {BaseScreen} from '../Template/BaseScreen';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {lecturasTotales} from '../interfaces/ApiInterface';
import {List} from '../components/List';
import {colores, styles} from '../theme/appTheme';
import {formatoDeFecha} from '../helpers/formatoDeFecha';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoaderContext} from '../context/LoaderContext';
import {sleep} from '../helpers/sleep';

export const ReadingScreen = () => {
  const {FormatoFechaAgenda} = formatoDeFecha();
  const {width} = useWindowDimensions();
  const {setIsFetching} = useContext(LoaderContext);
  const [lecturasGuardadas, setLecturasGuardadas] = useState<lecturasTotales[]>(
    [],
  );

  useEffect(() => {
    // Cargar las lecturas guardadas en "LecturasLocal" al inicio del component
    cargarLecturasGuardadas();
  }, []);

  const cargarLecturasGuardadas = async () => {
    try {
      const lecturasExistentes = await AsyncStorage.getItem('LecturasLocal');
      if (lecturasExistentes) {
        const lecturasExistentesArray: lecturasTotales[] =
          JSON.parse(lecturasExistentes);
        console.log('Lecturas guardadas:', lecturasExistentesArray);
        setLecturasGuardadas(lecturasExistentesArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const Catalogos = async () => {
    setIsFetching(true);
    cargarLecturasGuardadas();
    await sleep(2);
    setIsFetching(false);
  };

  const renderLecturas = (a: lecturasTotales) => {
    const fechaActual = FormatoFechaAgenda(new Date().toISOString());
    const fechaLectura = FormatoFechaAgenda(a.Fecha.toString());
    const esFechaActual = fechaLectura === fechaActual;

    return (
      <View key={a.id} style={lecturasStyless.itemContainer}>
        <View style={{...lecturasStyless.dateContainer, width: width * 0.2}}>
          <Text style={{fontSize: width * 0.045, ...lecturasStyless.date}}>
            {FormatoFechaAgenda(a.Fecha.toString())}
          </Text>
        </View>
        <View
          key={a.id}
          style={{...lecturasStyless.routeContainer, width: width * 0.7}}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {}}
            key={a.id}
            style={lecturasStyless.rutaContainer}>
            <View
              style={{
                width: width * 0.012,
                backgroundColor: esFechaActual ? colores.verdePasto : '#ff6961',
                ...lecturasStyless.bar,
              }}></View>
            <View style={{flexDirection: 'column'}}>
              <View
                style={{
                  alignItems: 'flex-end',
                  width: width * 0.65,
                }}>
                <Text style={lecturasStyless.routeCod}>{a.codLectura}</Text>
              </View>
              <Text style={lecturasStyless.route}>{a.Observacion}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BaseScreen>
      <Text style={lecturasStyless.routeCod}>
        {' '}
        Lecturas guardadas localmente
      </Text>
      <List
        data={lecturasGuardadas}
        refreshFunction={() => Catalogos()}
        renderItem={renderLecturas}
        ListEmptyText="No hay lecturas por visualizar"
      />
    </BaseScreen>
  );
};

const lecturasStyless = StyleSheet.create({
  container: {
    padding: 16,
  },
  itemContainer: {
    marginVertical: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    borderBottomColor: colores.plomoclaro,
  },
  dateContainer: {
    paddingRight: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  date: {
    color: '#424242',
    fontWeight: '500',
    textAlign: 'center',
  },
  routeContainer: {
    flexDirection: 'column',
  },
  bar: {
    height: '100%',
    marginRight: 5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rutaContainer: {
    height: '90%',
    padding: 1,
    ...styles.sombra,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: '#ececec',
  },
  route: {
    fontSize: 16,
    marginBottom: 4,
    color: colores.negro,
  },
  routeCod: {
    fontSize: 16,
    marginBottom: 4,
    color: colores.primario,
  },
});
