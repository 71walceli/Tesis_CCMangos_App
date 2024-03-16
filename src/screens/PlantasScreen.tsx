import React, {useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';

import {IPoligonos, IRegion, IPlanta} from '../interfaces/ApiInterface';
import {BaseScreen} from '../Template/BaseScreen';
import {ButtonWithText} from '../components/ButtonWithText';
import {LoaderContext} from '../context/LoaderContext';
import {useBaseStorage} from '../data/useBaseStorage';
import {colores} from '../theme/appTheme';
import { CheckInternetContext } from '../context/CheckInternetContext';
import { Endpoints } from '../../../Common/api/routes';
import { arrayIndexer } from '../helpers/utils';
import { useRequest } from '../api/useRequest';
import { AuthContext } from '../context/AuthContext';
import { Accordion } from '../components/Acordion';
import { isSubstring } from '../helpers/isSubstring';
import { SearchInput } from '../components/SearchInput';
import { ScrollView } from 'react-native-gesture-handler';


interface IndiceTipos {
  Plantas: IPlanta[];
}

export const PlantasScreen = () => {
  const {params} = useRoute();
  const {idArea, data, datos} = params as {
    idArea: number;
    data: IPoligonos | undefined;
    datos: IRegion | undefined;
  };
  const {setIsLoading} = useContext(LoaderContext);
  const {GetData, SaveData} = useBaseStorage();
  const [lecturaRealizada, setLecturaRealizada] = useState<number[]>([]);
  const elNavegadorMasChulo = useNavigation();
  
  const [Plantas, setPlantas] = useState<IPlanta[]>([]);
  const [indices, setIndices] = useState<IndiceTipos>()
  const {hasConection} = useContext(CheckInternetContext);
  const {getRequest} = useRequest()
  const {token} = useContext(AuthContext);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // 1. Los lotes más recientes se asumen de la caché.
      let _indice: IndiceTipos = {
        Plantas: [],
      }
      try {
        _indice.Plantas = await GetData<IPlanta[]>(`Plantas_idArea=${idArea}`)
        setPlantas(_indice.Plantas)
      } catch (error) {
        console.error('Error al cargar los datos desde AsyncStorage:', error);
      }
      if (hasConection && token.length > 0) {
        try {
          await getRequest<IPlanta[]>(`${Endpoints.Plantas}?id_area=${idArea}`)
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
      setIsLoading(false)
    };
    loadData();
  }, [hasConection]);

  const Locations = ({plantas, ...props}: {plantas: IPlanta[]}) => {  
    return <View style={props.style}>
      {plantas.map(l => {
        const valueOT = lecturaRealizada
          ? lecturaRealizada.includes(l.id)
          : false;

        return <ButtonWithText
          disabled={valueOT ? true : false || l.Disabled}
          key={l.id}
          onPress={() => elNavegadorMasChulo.dispatch(
            CommonActions.navigate('LecturaScreen', { l })
          )}
          title={l.Codigo_Planta}
          color={valueOT || l.Disabled
            ? colores.plomo
            : colores.LocationBg
          }
          icon="flower" 
        />;
      })}
    </View>
  }

  const [searchText, setSearchText] = useState("")
  const matchesText = (item, searchTerm) => searchTerm !== "" 
    && isSubstring(item.Codigo_Planta?.toLowerCase(), searchTerm?.toLowerCase())
  const filteredSearch = React.useMemo(() => Plantas
    .map(p => ({...p}))
    .filter(p => matchesText(p, searchText)), 
    [searchText]
  )

  return <BaseScreen isScroll={false}>
    <View style={{ width: '100%', marginBottom: 10 }}>
      <SearchInput value={searchText} onChange={setSearchText} placeholder={"Buscar Plantas"}/>
    </View>

    <ScrollView>
      {searchText !== ""
        ?<Accordion title='Resultados de búsqueda' expanded={filteredSearch.length > 0}>
          {filteredSearch.length > 0 
            ?<Locations plantas={filteredSearch} />
            :<Text>Sin Resultados</Text>
          }
        </Accordion>
        :null
      }
      {Plantas?.length > 0 ? (
        <View style={{
          width: "100%",
        }}>
          {Plantas.map(plnt => {
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
                title={plnt.Codigo_Planta}
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
    </ScrollView>
  </BaseScreen>;
};
