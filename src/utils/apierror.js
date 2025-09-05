class ApiError extends Error {
    constructor(
         statusCode,
        message = "Internal Server Error"
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message
    }
}

export default ApiError