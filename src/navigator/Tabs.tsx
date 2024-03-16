import React from 'react';
import {Platform} from 'react-native';
import {iconos} from '../theme/appTheme';
import {colores} from '../theme/appTheme';
import {InfoScreen} from '../screens/InfoScreen';
import {AreasLotes} from '../screens/AreasLotes';
import Icon from 'react-native-vector-icons/Ionicons';
import {ReadingScreen} from '../screens/ReadingScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {PerfilScreen} from '../screens/PerfilScreen';


const TabOptions = [
  {
    name: 'HomeScreen',
    title: 'Producción',
    icon: iconos.home,
    component: AreasLotes,
  },
  {
    name: 'Lecturs',
    title: 'Sincronización',
    icon: iconos.ordenDeTrabajo,
    component: ReadingScreen,
  },
  {
    name: 'InformacionScreen',
    title: 'Informacion',
    icon: iconos.info,
    component: InfoScreen,
  },
  {
    name: 'PerfilScreen',
    title: 'Perfil',
    icon: iconos.perfilOutline,
    component: PerfilScreen,
  },
];

export const Tabs = () => {
  return Platform.OS === 'ios' ? (
    <TabsIOS></TabsIOS>
  ) : (
    <TabsAndroid></TabsAndroid>
  );
};

const TabAndroid = createMaterialBottomTabNavigator();

const TabsAndroid = () => {
  return (
    <TabAndroid.Navigator
      sceneAnimationEnabled={true}
      barStyle={{backgroundColor: colores.blanco}}
      activeColor={colores.primario}
      inactiveColor={colores.plomo}>
      {TabOptions.map(({name, title, icon, component}, index) => (
        <TabAndroid.Screen
          key={index}
          name={name}
          options={{
            title,
            tabBarIcon: ({focused}) => (
              <Icon
                name={icon}
                size={28}
                color={focused ? colores.primario : colores.plomo}
              />
            ),
          }}
          component={component}
        />
      ))}
    </TabAndroid.Navigator>
  );
};

const TabIOS = createBottomTabNavigator();

const TabsIOS = () => {
  return (
    <TabIOS.Navigator sceneContainerStyle={{backgroundColor: 'white'}}>
      {TabOptions.map(({name, title, icon, component}, index) => (
        <TabIOS.Screen
          key={index}
          name={name}
          options={{
            title,
            tabBarIcon: () => (
              <Icon name={icon} size={25} color={colores.secundario} />
            ),
          }}
          component={component}
        />
      ))}
    </TabIOS.Navigator>
  );
};
