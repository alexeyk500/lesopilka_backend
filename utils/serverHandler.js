class ServerResponseHandler {
  json(response) {
    return { response, status: 200, message: 'success request' };
  }
}

const serverErrorHandler = (res) => {
  return res;
};

const serverResponseHandler = new ServerResponseHandler();

module.exports = { serverResponseHandler, serverErrorHandler };
