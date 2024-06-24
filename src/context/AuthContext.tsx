import React, {createContext, useContext, useEffect, useState} from 'react';
import {CreateUser, LoginData} from '../interfaces/UserInterface';
import {AlertContext} from './AlertContext';
import {useStorage} from '../data/useStorage';
import {useRequest} from '../api/useRequest';
import {TokenResponse} from 'common/interfaces/models';
import {Endpoints} from 'common/api/routes';
import { useBaseStorage } from '../data/useBaseStorage';
import { ROLES } from '../../../Common/data';


type AuthContextProps = {
  status: StatusTypes;
  //signUp: (obj: CreateUser, pass: string) => Promise<void>;
  signUp: (obj: CreateUser) => Promise<void>;
  signIn: (obj: LoginData) => Promise<void>;
  logOut: () => void;
  token: string;
};

type StatusTypes = 'checking' | 'authenticated' | 'notauthenticated';

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({children}: any) => {
  const {ShowAlert} = useContext(AlertContext);
  const {SaveJWTInfo, GetJWTInfo, CheckJWTInfo, RemoveAllData} = useStorage();
  const {postRequest} = useRequest();
  const [status, setstatus] = useState<StatusTypes>('checking');
  const [token, setToken] = useState<string>('');
  const {SaveData} = useBaseStorage()

  useEffect(() => {
    checkToken();
  }, []);

  /**
   * Checks if there is a token in local storage and attempts to authenticate with it
   * @returns void
   */
  const checkToken = async (): Promise<void> => {
    await CheckJWTInfo().then(check =>
      check
        ? GetJWTInfo().then(jwtInfo => {
            setToken(jwtInfo);
            console.log(jwtInfo)
            setstatus('authenticated');
            //startConnection(jwtInfo.token, jwtInfo.userName);
          })
        : setstatus('notauthenticated'),
    );
  };

  const signIn = async ({correo, password}: LoginData) => {
    if (correo.length === 0 || password.length === 0) {
      ShowAlert('default', {
        title: 'Error',
        message: 'Debe llenar los campos requeridos',
      });
      return;
    }

    await postRequest<TokenResponse>(Endpoints.login, {
      username: correo,
      password,
    })
      .then(jwtInfo => {
        const idRolObrero = ROLES.find(rol => rol.label === "Obrero").value
            console.log({idRolObrero});
            if (!jwtInfo.usuario.roles.includes(idRolObrero)) {
              const mensaje = "Solo obreros pueden iniciar sesión mediante interfaz Web";
              setstatus('notauthenticated')
              ShowAlert('default', { title: 'Error', message: mensaje,  });
              return
            }

        setstatus('authenticated');
        SaveJWTInfo(jwtInfo.access_token);
        SaveData(jwtInfo.usuario, "Usuario")
      })
      .catch(console.error);
  };

  const signUp = async ({ email, password, cedula, first_name, last_name, username, }: CreateUser) => {
    if (
      email.length === 0 ||
      password.length === 0 ||
      cedula.length === 0 ||
      first_name.length === 0 ||
      last_name.length === 0 ||
      username.length === 0
    ) {
      // If email or password not exist
      ShowAlert('default', {
        title: 'Error',
        message: 'Debe llenar los campos requeridos',
      });
      return;
    }

    await postRequest(Endpoints.register, {
      username,
      password,
      last_name,
      cedula,
      first_name,
      email,
    })
      .then((mss: any) => {
        ShowAlert('default', {
          message: mss ? mss : 'Usuario creado exitosamente, inicia sesión!',
          title: 'Exito',
        });
      })
      .catch(console.log);
  };

  const logOut = async () => {
    await RemoveAllData();
    //closeConnection();
    setstatus('notauthenticated');
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        token,
        signUp,
        signIn,
        logOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
