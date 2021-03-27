type ResponseStatus = 'error' | 'success';
type ResponseBody = string | object;

export const createResponse = (status: ResponseStatus, message: ResponseBody) => {
    return {status, message};
}