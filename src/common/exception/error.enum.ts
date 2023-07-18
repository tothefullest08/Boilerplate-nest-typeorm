export enum ErrorTypeEnum {
  UNAUTHORIZED_ERROR = 'unauthorized_error',
  ACCESS_TOKEN_EXPIRED_ERROR = 'access_token_expired_error',
  REFRESH_TOKEN_EXPIRED_ERROR = 'refresh_token_expired_error',
  UNAUTHORIZED_TOKEN_ERROR = 'unauthorized_token_error',

  CREATE_DATA_ERROR = 'create_data_error',
  GET_DATA_ERROR = 'get_data_error',
  UPDATE_DATA_ERROR = 'update_data_error',
  UPSERT_DATA_ERROR = 'upsert_data_error',
  DELETE_DATA_ERROR = 'delete_data_error',

  INPUT_PARAMETER_ERROR = 'input_parameter_error',
  INVALID_REQUEST_ERROR = 'invalid_request_error',
  BAD_REQUEST_ERROR = 'bad_request_error',
  DUPLICATE_ERROR = 'duplicate_error',
  NOT_FOUND_ERROR = 'not_found_error',

  INTERNAL_ERROR = 'internal_error',
  THIRD_PARTY_ERROR = 'third_party_error',
}
