export type BaseResponse<T, M = undefined> = {
  data: T;
  meta?: M;
};
