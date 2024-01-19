import {CommonActions, useNavigation} from '@react-navigation/native';
import {CheckInternetContext} from '../context/CheckInternetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Area, Geolotes, ILocation, Lote} from '../interfaces/ApiInterface';
import React, {useContext, useEffect, useState} from 'react';
import {ButtonWithText} from '../components/ButtonWithText';
import Geolocation from '@react-native-community/geolocation';
import {AuthContext} from '../context/AuthContext';
import {BaseScreen} from '../Template/BaseScreen';
import {colores} from '../theme/appTheme';
import {Metodos} from '../hooks/Metodos';
import {Text, View} from 'react-native';
import {SearchInput} from '../components/SearchInput';
import {ScrollView} from 'react-native-gesture-handler';
import { useRequest } from '../api/useRequest';
import { ApiEndpoints } from '../api/routes';
import { useStorage } from '../data/useStorage';
import { useBaseStorage } from '../data/useBaseStorage';
import { arrayIndexer } from '../helpers/utils';
import { Card } from 'react-native-paper';
import { Accordion } from '../components/Acordion';


interface IndiceTipos {
  GeoLotes: Geolotes[];
  Areas: Area[];
  Lotes: Lote[];
}

export const MainScreen = () => {
  const navigation = useNavigation();
  const {getRequest} = useRequest()
  const {GetData, SaveData} = useBaseStorage()
  const {token} = useContext(AuthContext);
  const {geolotes, pointInRegion, getPlantas} = Metodos();
  const {hasConection} = useContext(CheckInternetContext);
  const [Indices, setIndices] = useState<IndiceTipos>([]);
  const [Polígonos, setPolígonos] = useState<Geolotes[]>([]);
  const [Areas, setAreas] = useState<Area[]>([]);
  const [Lotes, setLotes] = useState<Lote[]>([]);
  const [filtrado, setFiltrado] = useState<Geolotes[]>([]);
  const [location, setLocation] = useState<ILocation | null>(null);

  const baseURL = `${ApiEndpoints.BaseURL}${ApiEndpoints.BaseApi}`;
  
  useEffect(() => {
    const loadData = async () => {
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
          await getRequest<Geolotes[]>(`${baseURL}${ApiEndpoints.Poligonos}`)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.GeoLotes = data
              SaveData(data, "GeoLotes")
              setPolígonos(data)
            });
            await getRequest<Area[]>(`${baseURL}${ApiEndpoints.areas}`)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.Areas = data
              SaveData(data, "Areas")
              setAreas(data)
            });
            await getRequest<Lote[]>(`${baseURL}${ApiEndpoints.lotes}`)
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
    };
    loadData();
  }, [hasConection]);
  
  /* 
  useEffect(() => {
    const loadData = async () => {
      // 1. Los lotes más recientes se asumen de la caché.
      try {
        setPolígonos(await GetData("GeoLotes"))
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      // 2. Si hay acceso a la API, se descargarán los datos más recientes.
      if (hasConection && token.length > 0) {
        try {
          await getRequest<Geolotes[]>(`${baseURL}${ApiEndpoints.Poligonos}`)
            .then(data => {
              SaveData(data, "GeoLotes")
              setPolígonos(data)
            });
        } catch (error) {
          // Manejar cualquier error que ocurra en geolotes o getPlantas
          console.error('Error en geolotes:', error);
        }
      }
    };
    loadData();
  }, [hasConection]);
  
  useEffect(() => {
    const loadData = async () => {
      // 1. Los lotes más recientes se asumen de la caché.
      try {
        setAreas(await GetData("Areas"))
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      // 2. Si hay acceso a la API, se descargarán los datos más recientes.
      if (hasConection && token.length > 0) {
        try {
          await getRequest<Area[]>(`${baseURL}${ApiEndpoints.areas}`)
            .then(data => {
              SaveData(data, "Areas")
              setAreas(data)
            });
        } catch (error) {
          console.error('Error en áreas:', error);
        }
      }
    };
    loadData();
  }, [hasConection]);
  
  useEffect(() => {
    const loadData = async () => {
      // 1. Los lotes más recientes se asumen de la caché.
      try {
        setLotes(await GetData("GeoLotes"))
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      // 2. Si hay acceso a la API, se descargarán los datos más recientes.
      if (hasConection && token.length > 0) {
        try {
          await getRequest<Lote[]>(`${baseURL}${ApiEndpoints.lotes}`)
            .then(data => {
              SaveData(data, "Lotes")
              setLotes(data)
            });
        } catch (error) {
          // Manejar cualquier error que ocurra en geolotes o getPlantas
          console.error('Error en lotes:', error);
        }
      }
    };
    loadData();
  }, [hasConection]);
   */
  // 3. Acá abajo se chequeará de acuerdo con las regiones más recientes.

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
        textCompare={(item: Geolotes) =>
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
