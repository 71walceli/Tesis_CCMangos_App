import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { IArea, IPoligonos, ILocation, ILote } from '../interfaces/ApiInterface';
import { Metodos } from '../hooks/Metodos';
import { CheckInternetContext } from '../context/CheckInternetContext';
import { ButtonWithText } from '../components/ButtonWithText';
import { AuthContext } from '../context/AuthContext';
import { BaseScreen } from '../Template/BaseScreen';
import { colores } from '../theme/appTheme';
import { useRequest } from '../api/useRequest';
import { Endpoints } from '../../../Common/api/routes';
import { useBaseStorage } from '../data/useBaseStorage';
import { arrayIndexer } from '../helpers/utils';
import { Accordion } from '../components/Acordion';
import { LoaderContext } from '../context/LoaderContext';
import { useLocationController } from '../hooks/useLocationController';
import { SearchInput } from '../components/SearchInput';
import { isSubstring } from '../helpers/isSubstring';


interface IndiceTipos {
  GeoLotes: IPoligonos[];
  Areas: IArea[];
  Lotes: ILote[];
}

export const AreasLotes = () => {
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
        if (!Polígonos) {
          return
        }
        const filteredPoligonos = Polígonos
          .filter(item => item.Id_Area )
          .filter(item =>
            pointInRegion(
              locationData.latitude,
              locationData.longitude,
              item.geocoordenadas.map((item: any) => ({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lng),
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
    if (Polígonos === undefined || Polígonos.length === 0) {
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
      lotes.map(l => <Accordion key={l.id} title={`${l.Codigo_Lote} ${l.Nombre}`} 
        expanded={l.Areas.length > 0}
      >
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
              title={a.Codigo_Area} 
            />)
          :<Text style={{ color: colores.negro }}>
            Sin lotes
          </Text>
        }
      </Accordion>)
    }</View>
  }

  const [searchText, setSearchText] = useState("")
  const matchesText = (item, searchTerm) => {
    searchTerm = searchTerm?.toLowerCase()

    return searchTerm !== "" && (
      isSubstring(item.Codigo_Lote?.toLowerCase(), searchTerm)
      || isSubstring(item.Codigo_Area?.toLowerCase(), searchTerm)
      || isSubstring(item.Nombre?.toLowerCase(), searchTerm)
    );
  }
  const filteredSearch = React.useMemo(() => Lotes
    .map(l => ({...l, Areas: l.Areas.map(a => Areas[Indices.Areas[a]])}))
    .filter(function nameMatches(l) {
      const meetsCriteria = matchesText(l, searchText);
      l.Areas = meetsCriteria ? l.Areas : l.Areas.filter(a => matchesText(a, searchText))
      const childCount = l.Areas.length
      return meetsCriteria || childCount > 0;
    }), 
    [searchText]
  )

  const closestRegions = useMemo(() => location?.region
    .map(r => {
      const _area = Areas[Indices.Areas?.[r.Id_Area]];
      const _lote = Lotes[Indices.Lotes?.[_area?.Id_Lote]];
      if (!_lote) {
        return;
      }
      return ({ ..._lote, Areas: [Areas[Indices.Areas?.[r.Id_Area]]] });
    })
    .filter(r => r)
    .map(l => ({
      [l.id]: l
    })),
    [location?.region]
  );

  return (
    <BaseScreen>
      <View style={{ width: '100%', marginBottom: 10 }}>
        <SearchInput value={searchText} onChange={setSearchText} 
          placeholder={"Buscar Lotes y áreas"}
        />
      </View>
      <View>
        {Object.keys(Indices).length > 0 && Lotes.length > 0 
          ?<ScrollView>
            {searchText !== "" && filteredSearch.length > 0
              ?<View>
                <Accordion title='Búsqueda' expanded
                  innerStyle={{
                    borderBottomWidth: 3,
                    borderBottomStyle: "solid",
                    borderBottomColor: colores.negro,
                    padding: 5,
                  }}
                >
                  <Locations
                    lotes={filteredSearch}
                  />
                </Accordion>
              </View>
              :<Text>No se encuentra lote o área.</Text>
            }
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
                    lotes={ // TODO Wra it in useMemo
                      Object.values(closestRegions
                        .reduce(
                          (all, _l) => {
                            const [id, l] = Object.entries(_l)[0]
                            l.Areas = (all[id]?.Areas || []).concat(l.Areas)
                            return Object.assign(all, { [id]: l })
                          },
                          {}
                        )
                      )
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
