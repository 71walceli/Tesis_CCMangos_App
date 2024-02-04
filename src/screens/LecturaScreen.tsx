import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BaseScreen } from '../Template/BaseScreen';
import { IEnfermedad, ILectura, IPlantas, IProfile } from "../../../Common/interfaces/models";
import { colores, iconos, styles } from '../theme/appTheme';
import { InputForm } from '../components/InputForm';
import { Card, List } from 'react-native-paper';
import { useWindowDimensions } from 'react-native';
import { ButtonWithText } from '../components/ButtonWithText';
import { AlertContext } from '../context/AlertContext';
import { CheckInternetContext } from '../context/CheckInternetContext';
import { useRequest } from '../api/useRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoints } from '../../../Common/api/routes';
import { useBaseStorage } from '../data/useBaseStorage';
import { StackHeader } from '../navigator/StackHeader';
import Icon from 'react-native-vector-icons/Ionicons';


export const LecturaScreen = () => {
  const route = useRoute();
  const { getRequest, postRequest } = useRequest();
  const { SaveData, GetData } = useBaseStorage();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { ShowAlert } = useContext(AlertContext);
  const [paginado, setPaginado] = useState<number>(0);
  const { hasConection } = useContext(CheckInternetContext);
  const { plnt } = route.params as {
    plnt: IPlantas;
  };
  const defaultFormLectura = () => ({
    CantidadInflorescencias: "",
    CantidadFrutonIniciales: "",
    CantidadFrutosMaduración: "",
    CantidadInflorescenciasPerdidas: "",
    Enfermedades: [],
    Observacion: "",
    FechaVisita: '',
  })
  // TODO Load from API
  const [enfermedades, setEnfermedades] = useState<IEnfermedad[]>()
  const [lectura, setLectura] = useState(defaultFormLectura());

  const [allLecturas, setAllLecturas] = useState<ILectura[]>([]);

  const generateFecha = () => {
    const dates = new Date().toISOString();
    setLectura({ ...lectura, ['FechaVisita']: dates });
  };

  useEffect(() => {
    generateFecha();
  }, []);
  useEffect(() => {
    if (enfermedades)
      return
    // TODO Cargar desde LocalStorage
    
    const cargarLocalmente = () => AsyncStorage.getItem("enfermedades")
      .then(data => {
        if (data)
          return JSON.parse(data);
        throw new Error("Sin datos")
      })
      .catch(() => [])

    if (hasConection) {
      getRequest<IEnfermedad[]>(Endpoints.enfermedad)
        .then(data => {
          setEnfermedades(data);
          AsyncStorage.setItem("enfermedades", JSON.stringify(data))
        })
        .catch(() => {
          cargarLocalmente().then(v => setEnfermedades(v))
        })
    } else {
      cargarLocalmente().then(v => setEnfermedades(v))
    }
  }, []);

  const guardarLecturasEnLocal = async (
    lecturas: ILectura[],
  ): Promise<boolean> => {
    try {
      // Obtén las lecturas existentes en "LecturasLocal" (si las hay)
      const lecturasExistentes = await AsyncStorage.getItem('LecturasLocal');
      let lecturasExistentesArray: ILectura[] = lecturasExistentes
        ? JSON.parse(lecturasExistentes)
        : [];

      // Agrega las lecturas nuevas al arreglo existente
      lecturasExistentesArray = [...lecturasExistentesArray, ...lecturas];

      // Guarda el arreglo actualizado en "LecturasLocal"
      await AsyncStorage.setItem(
        'LecturasLocal',
        JSON.stringify(lecturasExistentesArray),
      );

      ShowAlert('default', {
        title: 'Exito',
        message: 'Los datos se han guardado localmente.',
      });
      return true; // Devuelve true si el guardado fue exitoso
    } catch (error) {
      console.error(error);
      return false; // Devuelve false si hubo un error al guardar
    }
  };

  const plantaRegisterValue = (idPlanta: number) => {
    console.log(idPlanta);
    GetData<number[]>('OTRealizado')
      .then(a => {
        const newData = a || []; // Si a es undefined, asigna un arreglo vacío
        return SaveData([...newData, idPlanta], 'OTRealizado');
      })
      .catch(error =>
        console.log('Ocurrió un error al guardar localmente', error),
      );
  };

  const guardar = async () => {
    try {
      const nuevaLectura: ILectura = {
        Id_Planta: plnt.id,
        Id_Usuario: (JSON.parse(await AsyncStorage.getItem("Usuario") || "") as IProfile).user,
        CantidadInflorescencias: Number(lectura.CantidadInflorescencias),
        CantidadFrutonIniciales: Number(lectura.CantidadFrutonIniciales),
        CantidadFrutosMaduración: Number(lectura.CantidadFrutosMaduración),
        CantidadInflorescenciasPerdidas: Number(lectura.CantidadInflorescenciasPerdidas),
        Enfermedades: lectura.Enfermedades,
        Observacion: lectura.Observacion,
        FechaVisita: new Date(),
        Activo: true,
        SyncId: Date.now().toString(36) + Math.random().toString(36).substring(2),
      };

      // Agregar la nueva lectura a allLecturas
      setAllLecturas(prevLecturas => ({
        ...prevLecturas,
        ...nuevaLectura,
      }));

      if (hasConection) {
        await postRequest(Endpoints.Lectura, nuevaLectura)
          .then(async () => {
            plantaRegisterValue(plnt.id)
            ShowAlert('default', {
              title: 'Exito',
              message: 'Se guardó en el servidor correctamente.',
            });
            navigation.goBack();
            return true;
          })
          .catch(e => false);
      } else {
        const lecturasTotales =
          Object.keys(allLecturas).length === 0
            ? [...allLecturas, nuevaLectura]
            : [nuevaLectura];
        const guardadoExitoso = await guardarLecturasEnLocal(lecturasTotales);
        if (guardadoExitoso) {
          generateFecha();
          setLectura(defaultFormLectura());
          setPaginado(0);
          setAllLecturas([]);
          plantaRegisterValue(plnt.id);
          navigation.goBack();
          return true;
        } else {
          ShowAlert('default', {
            title: 'Error',
            message:
              'Ocurrió un error al intentar guardar los datos localmente.',
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Error en guardarLectura:', error);
      return false;
    }
  };

  // Inicialmente lo estaba haciendo Navigator, pero mejor aquí ya que allá no hay contexto de la 
  //  planta actual.
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <StackHeader title={'Ingresar Lectura'}
          actions={[
            <TouchableOpacity
              activeOpacity={0.6}
              // Passing plnt from here, as it's it this screen's context.
              //@ts-ignore as mavigate doesn't expect any args, yet it works.
              onPress={() => navigation.navigate('FotoPlantaScreen', { plnt })}
              style={{ height: 50, width: 50, ...styles.centerItems }}
            >
              <Icon name="camera" size={30} color={colores.blanco} />
            </TouchableOpacity>
          ]}
        />
      ),
    })
  }, [navigation])

  return (
    <BaseScreen isScroll={true}>
      <Card
        style={{
          backgroundColor: colores.plomoclaro,
          width: width * 0.9,
          ...styles.centerItems,
        }}>
        <Card.Title
          style={{
            ...stylesComprasGastos.titulo,
            width: width * 0.8,
            ...styles.centerItems,
          }}
          title={plnt.Codigo_Planta}
          titleStyle={{ ...stylesComprasGastos.title, fontSize: width * 0.055 }}
        />
        <Card.Content
          style={{
            width: width * 0.85,
            ...styles.centerItems,
            alignSelf: 'center',
          }}>
          {paginado === 0 ? (
            <>
              <View style={{ backgroundColor: colores.plomoclaro }}>
                <InputForm
                  colorBase={colores.plomoclaro}
                  keyboard="numeric"
                  placeholder={'N° Inflorescencias'}
                  value={lectura.CantidadInflorescencias}
                  onChange={value => setLectura({ ...lectura, CantidadInflorescencias: value })}
                />
                <InputForm
                  colorBase={colores.plomoclaro}
                  keyboard="numeric"
                  ancho={0.8}
                  placeholder={'N° Fructificaciones'}
                  value={lectura.CantidadFrutonIniciales}
                  onChange={value => setLectura({ ...lectura, CantidadFrutonIniciales: value })}
                />
                <InputForm
                  colorBase={colores.plomoclaro}
                  keyboard="numeric"
                  ancho={0.8}
                  placeholder={'N° Frutos en Maduración'}
                  value={lectura.CantidadFrutosMaduración}
                  onChange={value => setLectura({ ...lectura, CantidadFrutosMaduración: value })}
                />
                <InputForm
                  colorBase={colores.plomoclaro}
                  keyboard="numeric"
                  ancho={0.8}
                  placeholder={'N° Inflorescencias Perdidas'}
                  value={lectura.CantidadInflorescenciasPerdidas}
                  onChange={value => setLectura({ ...lectura, CantidadInflorescenciasPerdidas: value })}
                />
                <Card>
                  <Card.Title title="Enfermedades" />
                  <Card.Content>
                    {enfermedades?.map?.(e => (
                      <View key={e.id}>
                        {/* TODO Convert this into ListItem component */}
                        <List.Item
                          title={e.Nombre}
                          right={_ => <Icon size={25} color={colores.primario} name={
                            lectura.Enfermedades.includes(e.id)
                              ? "checkmark-circle" 
                              : "checkmark-circle-outline"
                          } />}
                          onPress={() => {
                            setLectura(prev => {
                              const index = prev.Enfermedades.indexOf(e.id)
                              index >= 0
                                ? prev.Enfermedades.splice(index, 1)
                                : prev.Enfermedades.push(e.id)
                              return {...prev}
                            })
                          }}
                        />
                      </View>
                    ) )}
                  </Card.Content>
                </Card>
                <InputForm
                  colorBase={colores.plomoclaro}
                  ancho={0.8}
                  placeholder={'Observacion'}
                  value={lectura.Observacion.toUpperCase()}
                  onChange={value => {
                    setLectura({ ...lectura, Observacion: value });
                  }}
                  multiline={true}
                />
                <View style={{ display: "flex", alignItems: "center" }}>
                  <ButtonWithText
                    icon={iconos.guardar}
                    onPress={guardar}
                    title="Guardar"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
            </>
          )}
        </Card.Content>
      </Card>
    </BaseScreen>
  );
};

const stylesComprasGastos = StyleSheet.create({
  titulo: {
    borderBottomWidth: 2,
    borderBottomColor: colores.primario,
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  txtTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  containerButon: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
