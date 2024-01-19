import React, {useContext, useEffect, useState} from 'react';
import {BaseScreen} from '../Template/BaseScreen';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Geolotes, IRegion, Planta, Plantas} from '../interfaces/ApiInterface';
import {
  CommonActions,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {ButtonWithText} from '../components/ButtonWithText';
import {LoaderContext} from '../context/LoaderContext';
import {useBaseStorage} from '../data/useBaseStorage';
import {colores} from '../theme/appTheme';
import { CheckInternetContext } from '../context/CheckInternetContext';
import { ApiEndpoints } from '../api/routes';
import { arrayIndexer } from '../helpers/utils';
import { useRequest } from '../api/useRequest';
import { AuthContext } from '../context/AuthContext';


interface IndiceTipos {
  Plantas: Planta[];
}

export const PlantasScreen = () => {
  const {params} = useRoute();
  const {idArea, data, datos} = params as {
    idArea: number;
    data: Geolotes | undefined;
    datos: IRegion | undefined;
  };
  const isFocused = useIsFocused();
  const {setIsLoading} = useContext(LoaderContext);
  const {GetData, SaveData} = useBaseStorage();
  const [lecturaRealizada, setLecturaRealizada] = useState<number[]>([]);
  const elNavegadorMasChulo = useNavigation();
  
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [Indices, setIndices] = useState<IndiceTipos>()
  const {hasConection} = useContext(CheckInternetContext);
  const {getRequest} = useRequest()
  const {token} = useContext(AuthContext);

  const baseURL = `${ApiEndpoints.BaseURL}${ApiEndpoints.BaseApi}`;

  useEffect(() => {
    if (isFocused) {
      GetData<number[]>('OTRealizado')
        .then(a => setLecturaRealizada(a))
        .catch(error =>
          console.log('Ocurrió un error al obtener localmente', error),
        );
      cargarPlantasGuardadas();
    }
  }, [isFocused]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Los lotes más recientes se asumen de la caché.
      let _indice: IndiceTipos = {
        Plantas: [],
      }
      try {
        _indice.Plantas = await GetData<Planta[]>(`Plantas_idArea=${idArea}`)
        setPlantas(_indice.Plantas)
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      if (hasConection && token.length > 0) {
        try {
          await getRequest<Planta[]>(`${baseURL}${ApiEndpoints.Plantas}?id_area=${idArea}`)
            .then(data => {
              data.sort((o1, o2) => o1.id > o2.id ? 1 : -1)
              _indice.Plantas = data
              SaveData(data, `Plantas_idArea=${idArea}`)
              setPlantas(data)
            });
        } catch (error) {
          // Manejar cualquier error que ocurra en geolotes o getPlantas
          console.error('Error en obtención de plantas desde API:', error);
        }
      }
      Object.entries(_indice).forEach(([key, value]) => {
        _indice[key] = arrayIndexer((v: typeof value) => v.id, value)
      })
      console.log({ _indice })
      setIndices(_indice)
    };
    loadData();
  }, [hasConection]);

  const cargarPlantasGuardadas = async () => {
    try {
      setIsLoading(true);
      const plantasGuardadas = await AsyncStorage.getItem('Plantas');
      if (plantasGuardadas) {
        const plantas: Planta[] = JSON.parse(plantasGuardadas);
        setPlantas(plantas);
      } else {
        console.log('No se encontraron platas guardados en AsyncStorage');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar las plantas desde AsyncStorage:', error);
    }
  };

  const plantasFilter = () => {
    // Filtra las plantas que tienen el mismo ID de lote que la ubicación actual
    const filterPlantas = plantas.filter(planta => planta.Id_Lote === idArea);

    return (
      <BaseScreen>
        <Text
          style={{
            color: colores.primario,
            fontWeight: 'bold',
            marginTop: 20,
          }}>
          {datos?.Cod || data?.CodigoLote}
        </Text>
        {plantas.length > 0 ? (
          <View>
            {plantas.map(plnt => {
              const valueOT = lecturaRealizada
                ? lecturaRealizada.includes(plnt.id)
                : false;

              return (
                <ButtonWithText
                  disabled={valueOT ? true : false || plnt.Disabled}
                  key={plnt.id}
                  onPress={() =>
                    elNavegadorMasChulo.dispatch(
                      CommonActions.navigate('LecturaScreen', {plnt}),
                    )
                  }
                  title={plnt.Nombre}
                  color={
                    valueOT || plnt.Disabled
                      ? colores.plomo
                      : colores.LocationBg
                  }
                  icon="flower"
                />
              );
            })}
          </View>
        ) : (
          <>
            <Text style={{textAlign: 'center', color: 'black'}}>
              No hay plantas disponibles en tu lote.
            </Text>
          </>
        )}
      </BaseScreen>
    );
  };

  return <BaseScreen isScroll={true}>{plantasFilter()}</BaseScreen>;
};
