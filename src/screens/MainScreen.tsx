import {CommonActions, useNavigation } from '@react-navigation/native';
import {CheckInternetContext } from '../context/CheckInternetContext';
import {IArea, IPoligonos, ILocation, ILote} from '../interfaces/ApiInterface';
import React, {useContext, useEffect, useState } from 'react';
import { ButtonWithText } from '../components/ButtonWithText';
import Geolocation from '@react-native-community/geolocation';
import { AuthContext } from '../context/AuthContext';
import { BaseScreen } from '../Template/BaseScreen';
import { colores } from '../theme/appTheme';
import { Metodos } from '../hooks/Metodos';
import { Text, View } from 'react-native';
import { SearchInput } from '../components/SearchInput';
import { ScrollView } from 'react-native-gesture-handler';
import { useRequest } from '../api/useRequest';
import { Endpoints } from '../../../Common/api/routes';
import { useBaseStorage } from '../data/useBaseStorage';
import { arrayIndexer } from '../helpers/utils';
import { Accordion } from '../components/Acordion';
import { LoaderContext } from '../context/LoaderContext';


interface IndiceTipos {
  GeoLotes: IPoligonos[];
  Areas: IArea[];
  Lotes: ILote[];
}

export const MainScreen = () => {
  const {setIsLoading} = useContext(LoaderContext);
  const navigation = useNavigation();
  const {getRequest} = useRequest()
  const {GetData, SaveData} = useBaseStorage()
  const {token} = useContext(AuthContext);
  const {geolotes, pointInRegion, getPlantas} = Metodos();
  const {hasConection} = useContext(CheckInternetContext);
  const [Indices, setIndices] = useState<IndiceTipos>([]);
  const [Polígonos, setPolígonos] = useState<IPoligonos[]>([]);
  const [Areas, setAreas] = useState<IArea[]>([]);
  const [Lotes, setLotes] = useState<ILote[]>([]);
  const [filtrado, setFiltrado] = useState<IPoligonos[]>([]);
  const [location, setLocation] = useState<ILocation | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // 1. Los lotes más recientes se asumen de la caché.
      let _indice: IndiceTipos = {
        GeoLotes: [],
        Areas: [],
        Lotes: []
      }
      try {
        _indice.GeoLotes = await GetData("GeoLotes")
        setPolígonos(_indice.GeoLotes)
        _indice.Areas = await GetData("Areas")
        setAreas(_indice.Areas)
        _indice.Lotes = await GetData("Lotes")
        setLotes(_indice.Lotes)
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      // 2. Si hay acceso a la API, se descargarán los datos más recientes.
      if (hasConection && token.length > 0) {
        try {
          await getRequest<IPoligonos[]>(Endpoints.Poligonos)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.GeoLotes = data
              SaveData(data, "GeoLotes")
              setPolígonos(data)
            });
          await getRequest<IArea[]>(Endpoints.áreas)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.Areas = data
              SaveData(data, "Areas")
              setAreas(data)
            });
          await getRequest<ILote[]>(Endpoints.lotes)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.Lotes = data
              SaveData(data, "Lotes")
              setLotes(data)
            });
        } catch (error) {
          // Manejar cualquier error que ocurra en geolotes o getPlantas
          console.error('Error en geolotes:', error);
        }
      }
      Object.entries(_indice).forEach(([key, value]) => {
        _indice[key] = arrayIndexer((v: typeof value) => v.id, value)
      })
      console.log(_indice)
      setIndices(_indice)
      setIsLoading(false)
    };
    loadData();
  }, [hasConection]);

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const locationData: any = position.coords;
        // Filtrar los polígonos basados en la ubicación actual
        const filteredPoligonos = Polígonos.filter(item =>
          pointInRegion(
            locationData.latitude,
            locationData.longitude,
            item.geocoordenadas.map((item: any) => ({
              longitude: parseFloat(item.lng),
              latitude: parseFloat(item.lat),
            })),
          ),
        );
        // Mapear los polígonos filtrados a un arreglo de objetos
        const regionData = filteredPoligonos.map(item => ({
          Lote: item.Lote,
          Id: item.Id_Lote,
          Cod: item.CodigoLote,
        }));
        // Asignar la propiedad 'region' en locationData con los datos mapeados
        locationData.region = regionData;

        // Actualizar el estado con los datos de ubicación
        setLocation(locationData);
      },
      error => {
        //console.error('Error getting location:', error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    if (Polígonos && Polígonos.length === 0) {
      return;
    }
    getLocation();
    let refrescarUbicación: NodeJS.Timeout | null;
    refrescarUbicación = setInterval(async () => {
      getLocation();
    }, 5000);

    return () => {
      if (refrescarUbicación) {
        clearInterval(refrescarUbicación);
      }
    };
  }, [Polígonos]); // Añadir poligonos como dependencia

  return (
    <BaseScreen>
      <SearchInput
        placeholder={'Buscar por código de lote'}
        keyBoard="visible-password"
        catalog={Polígonos}
        textCompare={(item: IPoligonos) =>
          item.CodigoLote !== null ? [item.CodigoLote] : []
        }
        result={setFiltrado}
      />
      <View>
        {Object.keys(Indices).length > 0 && Lotes.length > 0 
          ?(
            <ScrollView>
              {Lotes.map(l => <Accordion key={l.id} title={l.Nombre} expanded={l.Areas.length > 0}
                innerStyle={{ backgroundColor: colores.blanco }}
              >
                {l.Areas.length > 0 
                  ?l.Areas.map(a => Areas[Indices.Areas[a]])
                    .map(a => (
                      <ButtonWithText
                        key={a.id}
                        onPress={() => {
                          navigation.dispatch(
                            CommonActions.navigate('PlantasScreen', {
                              idArea: a.id,
                              data: a,
                              title: a.Codigo_Area,
                            })
                          );
                        } }
                        icon="location"
                        title={a.Nombre} 
                      />
                    ))
                  :<Text style={{ color: colores.negro }}>
                    Sin áreas
                  </Text>
                }
              </Accordion>)}
            </ScrollView>
          ) 
          :<Text>No existen lotes ni áreas</Text>
        }
      </View>

      <View>
        {location && location.region ? (
          location?.region.map((a, index) => (
            <ButtonWithText
              key={index}
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('PlantasScreen', {
                    idArea: a.Id,
                    datos: a,
                    title: a.Lote,
                  }),
                );
              }}
              icon="arrow"
              title={a.Cod}
            />
          ))
        ) : (
          <>
            <Text style={{color: colores.negro}}>
              No hay lotes cercanos disponibles, puedes buscarlo por su código.
            </Text>
          </>
        )}
      </View>
    </BaseScreen>
  );
};
