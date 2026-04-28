export function customResponse<T>(message: string, data: T | null = null) {
  return {
    message,
    data,
  };
}