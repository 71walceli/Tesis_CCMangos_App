import {useContext} from 'react';
import axios, {AxiosError, AxiosResponse} from 'axios';

import {AlertContext} from '../context/AlertContext';
import {LoaderContext} from '../context/LoaderContext';
import {ApiErrorResponse} from '../interfaces/BaseApiInterface';
import {AuthContext} from '../context/AuthContext';
import { Endpoints } from '../../../Common/api/routes';
import { printStackTrace } from '../helpers/utils';


export const useRequest = () => {
  const {ShowAlertApiError} = useContext(AlertContext);
  const {setIsLoading} = useContext(LoaderContext);

  //#region AxiosConfig

  const {token} = useContext(AuthContext);
  // Create an axios instance for the token endpoint
  const ApiTokenRequest = axios.create({
    baseURL: Endpoints.BaseURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  // Create an axios instance for the other endpoints
  const ApiRequest = axios.create({
    baseURL: Endpoints.BaseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && token.length > 0 !== undefined
        ? {Authorization: `Bearer ${token}`}
        : {}),
    },
  });
  const ApiPostFileRequest = axios.create({
    baseURL: Endpoints.BaseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
      otherHeader: 'foo',
    },
  });

  //#endregion

  //#region RequestConfig

  const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
    ShowAlertApiError(error);
    console.error({
      cause: error.cause,
      statusCode: error.status,
      response: error.response?.data,
      code: error.code,
      message: error.message,
      stackTrace: printStackTrace(error),
    });
    throw error;
  };

  const getRequest = async <T extends unknown>(
    endpoint: string,
    params?: object,
    isLoading?: boolean,
  ): Promise<T> => {
    isLoading && setIsLoading(true);
    return await ApiRequest.get(endpoint, {params})
      .then(({data}: AxiosResponse<T>) => data)
      .catch(handleApiError)
      .finally(() => {
        isLoading && setIsLoading(false);
      });
  };

  const postRequest = async <T extends unknown>(
    endpoint: string,
    data?: object,
    params?: object,
  ): Promise<T> => {
    setIsLoading(true);

    return await ApiRequest.post(endpoint, data, {params})
      .then(({data}: AxiosResponse<T>) => data)
      .catch(handleApiError)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const postRequestToken = async <T extends unknown>(
    data: string,
  ): Promise<T> => {
    setIsLoading(true);
    return await ApiTokenRequest.request({
      data,
    })
      .then(({data}: AxiosResponse<T>) => data)
      .catch(handleApiError)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const postFileRequest = async <T extends unknown>(
    endpoint: string,
    data?: object,
    params?: object,
  ): Promise<T> => {
    setIsLoading(true);
    return await ApiPostFileRequest.post(endpoint, data, {params})
      .then(({data}: AxiosResponse<T>) => data)
      .catch(handleApiError)
      .finally(() => {
        setIsLoading(false);
      });
  };

  //#endregion

  return {getRequest, postRequestToken, postRequest, postFileRequest};
};
