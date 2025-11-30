//ALIASES

export type Id = number;
export type Name = string;

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

//DB

export interface ExecRequest {
  query: string;
}

export interface ExecResponse {
  result: any;
  message: string;
}

export interface GetAllRequest {
  table: string;
  fields: string[];
}

export interface GetAllResponse {
  result: any[];
  message: string;
}

//DEVICES

export interface DBDevice {
  id: number;
  name: string;
  user_id: number;
  template: number;
}

export interface AddDeviceRequest {
  name: string;
  user_id?: number;
  template: string;
}

export interface AddDeviceResponse {
  result: number;
  message: string;
}

export interface ModifyDeviceRequest extends DBDevice {
  // Inherits all fields from DBDevice
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

export interface ModifyFieldRequest extends DBField {
  // Inherits all fields from DBField
}

export interface ModifyFieldResponse {
  result: any;
  message: string;
}

export interface GetFieldsRequest {
  type: number;
}

export interface GetFieldsResponse {
  result: TypeDeps;
  message: string;
}

export interface TempField extends DBField {
  QRef: number
}

//TYPES

export interface DBType {
  id: number;
  name: string;
  base_type: boolean;
  locked: boolean;
}

export interface TypeDeps {
  name: string;
  type: number;
  fields: TempField[];
  deps: number[]
}

export interface RemoveTypeRequest {
  id: number;
}

export interface RemoveTypeResponse {
  result: any;
  message: string;
}

//LOGIC STATES

export interface DBLogicState {
  id: number;
  name: string;
  value: string[];
}

export interface AddLogicStateRequest {
  name: string;
  value: string[];
}

export interface AddLogicStateResponse {
  result: any;
  message: string;
}

export interface ModifyLogicStateRequest extends DBLogicState {
  // Inherits all fields from DBLogicState
}

export interface ModifyLogicStateResponse {
  result: any;
  message: string;
}

export interface RemoveLogicStateRequest {
  id: number;
}

export interface RemoveLogicStateResponse {
  result: any;
  message: string;
}

//TEMPLATES

export interface DBTemplate {
  id: number;
  name: string;
}

export interface AddTemplateRequest {
  name: string;
}

export interface AddTemplateResponse {
  result: number;
  message: string;
}

export interface ModifyTemplateRequest extends DBTemplate {
  // Inherits all fields from DBTemplate
}

export interface ModifyTemplateResponse {
  result: any;
  message: string;
}

export interface GetTemplatesRequest {
  // No parameters needed for this request
}

export interface GetTemplatesResponse {
  result: any[];
  message: string;
}

export interface RemoveTemplateRequest {
  id: number;
}

export interface RemoveTemplateResponse {
  result: any;
  message: string;
}

//UNITS OF MEASURE

export interface DBUm {
  id: number;
  name: string;
  metric: string;
  imperial: string;
  gain: number;
  offset: number;
}

export interface AddUmRequest {
  name: string;
  metric: string;
  imperial: string;
  gain: number;
  offset: number;
}

export interface AddUmResponse {
  result: any;
  message: string;
}

export interface ModifyUmRequest extends DBUm {
  // Inherits all fields from DBUm
}

export interface ModifyUmResponse {
  result: any;
  message: string;
}

export interface RemoveUmRequest {
  id: number;
}

export interface RemoveUmResponse {
  result: any;
  message: string;
}

//USERS

export interface DBUser {
  id: number;
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'user';
}

export interface GetUsersRequest {
  // No parameters needed for this request
}

export interface GetUsersResponse {
  result: any[];
  message: string;
}

export interface ModifyUserRequest {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ModifyUserResponse {
  result: any;
  message: string;
}

export interface RemoveUserRequest {
  id: number;
}

export interface RemoveUserResponse {
  result: any;
  message: string;
}

//VARS

export interface DBVar {
  id: number;
  name: string;
  type: number;
  template: number;
  fixed_id: number;
  um: number | null;
  logic_state: number | null;
  comment: string | null;
}

export interface TempVar extends DBVar {
  QRef: number;
}

export interface GetVarsRequest {
  template: number;
}

export interface GetVarsResult {
  name: string;
  template: number;
  vars: TempVar[];
}

export interface GetVarsResponse {
  result: GetVarsResult;
  message: string;
}

//TAGS

export interface DBTag {
  id: number;
  name: string;
  device: number;
  var: number;
  parent_tag: number | null;
  type_field: number | null;
  um: number | null;
  logic_state: number | null;
  comment: string | null;
  value: any;
  fixed_id: number;
}

export interface DeleteTagsRequest {
  // No parameters needed for this request
}

export interface DeleteTagsResponse {
  result: any;
  message: string;
}

export interface RefreshTagsRequest {
  // No parameters needed for this request
}

export interface RefreshTagsResponse {
  message: string;
}

//CONTROLS

export interface Control {
  device: number;
  id: number;
  name: string;
  um: number | null;
  logic_state: number | null;
  fixed_id: number | null;
  comment: string | null;
  fields: Record<string, number | null>;
}

export interface Controls {
    [controlName: string]: Control;
}

export interface GetAllControlsResult {
  [deviceName: string]: Controls;
}

export interface GetAllControlsRequest {
  // No parameters needed for this request
}

export interface GetAllControlsResponse {
  result: GetAllControlsResult;
  message: string;
}

//USER APP

export interface GetUserDeviceDetailsRequest {
  deviceId: number;
}

export interface GetUserDeviceDetailsResponse {
  result: any;
  message: string;
}