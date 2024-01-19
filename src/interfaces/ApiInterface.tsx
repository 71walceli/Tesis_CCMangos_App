export interface IProyecto {
  id: number;
  Codigo_Proyecto: string;
  Nombre: string;
  Id_Hacienda: number;
  Activo: boolean;
}
export interface ILote {
  id: number;
  Codigo_Lote: string;
  Nombre: string;
  Hectareas: number | null;
  Variedad: null;
  Id_Proyecto: number;
  Activo: boolean;
}

export interface ILectura {
  id: number | null;
  E1: number | null;
  E2: number | null;
  E3: number | null;
  E4: number | null;
  E5: number | null;
  GR1: number | null;
  GR2: number | null;
  GR3: number | null;
  GR4: number | null;
  GR5: number | null;
  Cherelles: null | number;
  Observacion: string;
  FechaVisita: Date;
  Activo: boolean;
  Id_Planta: number;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  altitudeAccuracy?: number | null;
  region: IRegion[];
}

export interface IRegion {
  Id: number;
  Lote: string;
  Cod: string;
}
export interface IVertices {
  latitude: number;
  longitude: number;
}

export interface GlobalLecturas {
  Id_Planta: number;
  planta: string;
  E1: string;
  E2: string;
  E3: string;
  E4: string;
  E5: string;
  GR1: string;
  GR2: string;
  GR3: string;
  GR4: string;
  GR5: string;
  Cherelles: string;
  Total: string;
  Observacion: string;
  SyncId: string;
  Fecha_Visita: string;
}

export interface Lote {
  id: number;
  Id_Proyecto: number;
  Codigo_Lote: string;
  Nombre: string;
  Variedad: string;
  Hectareas: number;
  Activo: boolean;
  Usuario: number;
  Areas: number[];
  Poligonos: number[];
}

export interface Area {
  Id_Lote: number;
  id: number;
  Codigo_Area: string;
  Nombre: string;
  Variedad: string;
  Hectareas: number;
  Activo: boolean;
  Usuario: number;
  Plantas: number[];
  Poligonos: number[];
}

export interface Planta {
  id: number;
  Id_Area: number;
  Codigo_Planta: string;
  Nombre: string;
  Circunferencia: number;
  Activo: boolean;
  lat: number;
  lng: number;
  VisibleToStudent: boolean;
  Disabled: boolean;
}

export interface Plantas {
  id: number;
  Disabled: boolean;
  Codigo_Planta: string;
  Nombre: string;
  Activo: boolean;
  Id_Lote: number;
}

export interface Geolotes {
  id: number;
  FillColor: string;
  Activo: boolean;
  Usuario: number;
  Id_Lote: number;
  Id_Area: number;
  Lote: string;
  CodigoLote: string;
  geocoordenadas: Geocoordenada[];
}

export interface Geocoordenada {
  id: number;
  lat: number;
  lng: number;
  Activo: boolean;
  Usuario: number;
  Id_Poligono: number;
}

export interface Porfile {
  cedula: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
