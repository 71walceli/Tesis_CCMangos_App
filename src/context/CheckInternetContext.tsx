import React, {createContext, useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

type CheckInternetContextProps = {
  hasConection: boolean;
};

export const CheckInternetContext = createContext(
  {} as CheckInternetContextProps,
);

export const CheckInternetProvider = ({children}: any) => {
  const forceHasConnection = null
  const [hasConection, sethasConection] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state =>{
      const isConnected = forceHasConnection === null ? state.isConnected : forceHasConnection
      isConnected 
        ?Toast.show({
          type: 'success',
          text1: 'Aviso',
          text2: 'La conexión a internet se ha restablecido',
        })
        :Toast.show({
          type: 'error',
          text1: 'Aviso',
          text2: 'Sin conexión a internet',
          autoHide: false,
        });
      sethasConection(isConnected || false)
    },);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <CheckInternetContext.Provider value={{
      hasConection: forceHasConnection === null ? hasConection : forceHasConnection
    }}>
      {children}
    </CheckInternetContext.Provider>
  );
};
