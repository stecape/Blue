//BACKEND

// Estensione del tipo Request per includere req.user
export interface AuthUser {
  id: number;
  role: 'admin' | 'user';
}
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export interface ErrorResponse {
  code: string;
  detail: string;
  message: string;
}

export interface BackendStatusResult {
  dbConnected: boolean;
  mqttConnected: boolean;
}

export interface BackendStatusResponse {
  result: BackendStatusResult;
  message: string;
}

//DEVICES

export interface AddDeviceRequest {
  name: string;
  user_id?: number;
  template: string;
}

export interface AddDeviceResponse {
  result: number;
  message: string;
}

export interface ModifyDeviceRequest {
  id: number;
  name: string;
  template: string;
  user_id: number;
}

export interface ModifyDeviceResponse {
  result: any;
  message: string;
}

export interface GetDevicesRequest {
  // No parameters needed for this request
}

export interface GetDevicesResponse {
  result: any[];
  message: string;
}

export interface RemoveDeviceRequest {
  id: number;
}

export interface RemoveDeviceResponse {
  result: any[];
  message: string;
}

//FIELDS

export interface AddFieldRequest {
  name: string;
  type: number;
  parent_type: number;
  fixed_id: number;
  um: number;
  logic_state: number;
  comment: string;
}

export interface AddFieldResponse {
  result: number;
  message: string;
}

export interface ModifyFieldRequest {
  id: number;
  name: string;
  type: number;
  parent_type: number;
  fixed_id: number;
  um: number;
  logic_state: number;
  comment: string;
}

export interface ModifyFieldResponse {
  result: any;
  message: string;
}

export interface GetFieldsRequest {
  // No parameters needed for this request
}

export interface GetFieldsResponse {
  result: any;
  message: string;
}

export interface DBField {
  id: number;
  name: string;
  type: number;
  parent_type: number;
  fixed_id: number;
  um: number;
  logic_state: number;
  comment: string
}

export interface TempField extends DBField {
  QRef: number
}

//TYPES

export interface TypeDeps {
  name: string;
  type: number;
  fields: TempField[];
  deps: any[]
}

export interface TypeParentPairObj {
  type: number;
  parent_type: number;
}

export type TypeToDependentParentsMap = [number,  number[]][];