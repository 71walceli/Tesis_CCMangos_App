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
import { useLocationController } from '../hooks/useLocationController';


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
  const [Indices, setIndices] = useState<IndiceTipos>({});
  const [Polígonos, setPolígonos] = useState<IPoligonos[]>([]);
  const [Areas, setAreas] = useState<IArea[]>([]);
  const [Lotes, setLotes] = useState<ILote[]>([]);
  const [filtrado, setFiltrado] = useState<IPoligonos[]>([]);
  const [location, setLocation] = useState<ILocation | null>(null);

  useEffect(() => { // Data loading
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
      setIndices(_indice)
      setIsLoading(false)
    };
    loadData();
  }, [hasConection]);

  const LOCATION_UPDATE_INTERVAL = 15000
  const {getLocation} = useLocationController(
    {
      enableHighAccuracy: true, 
      timeout: LOCATION_UPDATE_INTERVAL, 
      maximumAge: 10000
    },
    /* {
      coords: {
        latitude: -2.1260429,
        longitude: -79.9876802,
      }
    } */
  )
  const updateLocation = () => {
    getLocation()
      .then(position => {
        const locationData: any = position.coords;
        // Filtrar los polígonos basados en la ubicación actual
        const filteredPoligonos = Polígonos
          .filter(item => item.Id_Area )
          .filter(item =>
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
        const regionData = filteredPoligonos.map(item => {
          return ({
            Id_Area: item.Id_Area,
            Id_Lote: item.Id_Lote,
            Cod: item.CodigoLote,
          });
        });
        // Asignar la propiedad 'region' en locationData con los datos mapeados
        locationData.region = regionData;

        // Actualizar el estado con los datos de ubicación
        setLocation(locationData);
        console.log({ locationData })
      })
      .catch(error => console.error(error))  // TODO Set some state regarding about permission or GPS off)
  };
  useEffect(() => console.log({ regions: location?.region }), [location])

  useEffect(() => {
    if (Polígonos && Polígonos.length === 0) {
      return;
    }
    updateLocation();
    let refrescarUbicación: NodeJS.timeout | null;
    refrescarUbicación = setInterval(updateLocation, LOCATION_UPDATE_INTERVAL);
    
    return () => {
      if (refrescarUbicación) {
        clearInterval(refrescarUbicación);
      }
    };
  }, [Polígonos]);

  const Locations = ({lotes, ...props}: {lotes: ILote[]}) => {  
    return <View style={props.style}>{
      lotes.map(l => <Accordion key={l.id} title={l.Nombre} expanded={l.Areas.length > 0}>
        {l.Areas.length > 0 
          ?l.Areas
            .map(a => <ButtonWithText key={a.id}
              onPress={() => navigation.dispatch(
                CommonActions.navigate('PlantasScreen', {
                  idArea: a.id,
                  data: a,
                  title: a.Codigo_Area,
                })
              )}
              icon="location"
              title={a.Nombre} 
            />)
          :<Text style={{ color: colores.negro }}>
            Sin lotes
          </Text>
        }
      </Accordion>)
    }</View>
  }

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
          ?<ScrollView>
            {location?.region?.length 
              ?<View>
                <Accordion title='Áreas y lotes cercanos'
                  innerStyle={{
                    borderBottomWidth: 3,
                    borderBottomStyle: "solid",
                    borderBottomColor: colores.negro,
                    padding: 5,
                  }}
                >
                  <Locations
                    lotes={location.region
                      .map(r => {
                        const _area = Areas[Indices.Areas[r.Id_Area]];
                        console.log({_area})
                        const _lote = Lotes[Indices.Lotes[_area.Id_Lote]];
                        return ({ ..._lote, Areas: [Areas[Indices.Areas[r.Id_Area]]] });
                      })
                      /* .reduce((all, lote) => {
                        const loteAnterior = all[lote.id];
                        loteAnterior.Areas
                        all[lote.id] = loteAnterior || lote
                        return all
                      }, {}) */
                    }
                  />
                </Accordion>
              </View>
              :null
            }
            <Locations
              lotes={Lotes.map(l => ({...l, Areas: l.Areas.map(id => Areas[Indices.Areas[id]])}))}
            />

            {/* Overscroll */}
            <View style={{ width: "100%", height: 56, }} />
          </ScrollView>
          :<Text>No existen lotes ni áreas</Text>
        }
      </View>
    </BaseScreen>
  );
};
