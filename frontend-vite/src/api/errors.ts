export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new APIError(
      error.response.status,
      error.response.data.message || 'An error occurred',
      error.response.data
    );
  } else if (error.request) {
    // The request was made but no response was received
    throw new APIError(
      0,
      'No response received from server'
    );
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new APIError(
      0,
      error.message || 'Unknown error occurred'
    );
  }
};
