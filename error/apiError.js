class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  static badRequest(message) {
    console.log('badRequest Error message =', message);
    return new ApiError(404, message);
  }

  static internal(message) {
    console.log('internal Error message =', message);
    return new ApiError(500, message);
  }

  static forbidden(message) {
    console.log('forbidden Error message =', message);
    return new ApiError(403, message);
  }
}

module.exports = ApiError;
