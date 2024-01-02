export const ApiEndpoints = {
  //BaseURL: 'https://victoria-api.up.railway.app',
  // BaseURL:
  //   process.env.NODE_ENV === 'production'
  //     ? 'https://victoria-api.up.railway.app/'
  //     : 'https://e121-157-100-158-182.ngrok-free.app',
  BaseURL: 'http://django:8080/',
  BaseApi: '/api',
  login: '/auth/login/',
  register: '/auth/register/',
  Token: '/auth/refresh/',
  Poligonos: '/geolotes/',
  perfil: '/auth/porfile/',
  Lectura: '/lecturas/',
  Enfermedad: '/enfermedades/',
  Plantas: '/plantas/',
};
