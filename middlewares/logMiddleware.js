import logFunction from '../banco/functions/logFunction.js';

function logMiddleware(req, res, next) {
    if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
        return next();
    }

    const method = req.method;
    const path = req.originalUrl;
    const params = req.params || {};
    const query = req.query || {};
    const body = req.body || {};

    res.on('finish', () => {
        const logData = {
            method,
            path,
            params,
            query,
            body,
            statusCode: res.statusCode,
        };

        logFunction.criar(logData).catch(console.error);
    });

    next();
}

export default logMiddleware;