export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

export type ISiteMetaData = {
  id: string;
  name: string;
  displayName: string;
  addresstype: string;
  latitude: number;
  longitude: number;
  state: string;
  province: string;
  country: string;
};

export interface Point {
  key: string;
  location: google.maps.LatLngLiteral;
  display_name: string;
  region?: string;
  infrastructure_id?: string;
  status: Record<string, { message: string; status: string }>;
  imei: [string];
}

interface Site {
  id: string;
  latitude: number;
  longitude: number;
  displayName: string;
  status?: string;
}
