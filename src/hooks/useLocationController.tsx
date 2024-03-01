import Geolocation, { GeolocationOptions } from '@react-native-community/geolocation';


export const useLocationController = (options?: GeolocationOptions, defaultPosition?: GeolocationPosition) => {
  const getLocation = () => new Promise((resolve, reject) => {
    defaultPosition 
      ?resolve(defaultPosition)
      :Geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        options
      )
  })

  return  { getLocation }
}