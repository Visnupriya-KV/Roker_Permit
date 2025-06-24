const axios = require('axios'); // Or import axios from 'axios'; if using ES modules

function formatBodyForLog(data) {
    if (data === undefined || data === null) return '<none>';
    if (typeof data === 'string') return data;
    if (data instanceof FormData) {
        const keys = [];
        for (const key of data.keys()) {
            keys.push(key);
        }
        return `[FormData with keys: ${keys.join(', ')}]`;
    }
    try {
        return JSON.stringify(data, null, 2);
    } catch (e) {
        return '[Could not serialize body]';
    }
}

function formatHeadersForLog(headersObject) {
    if (!headersObject || Object.keys(headersObject).length === 0) return '<none>';
    const lines = [];
    for (const key in headersObject) {
        if (Object.hasOwnProperty.call(headersObject, key)) {
            const value = headersObject[key];
            // Axios response headers might have 'set-cookie' as an array
            lines.push(`${key}=${Array.isArray(value) ? value.join('; ') : value}`);
        }
    }
    return lines.join('\n');
}

function printFormattedHeaders(label, headersString) {
    const lines = headersString.split('\n');
    const firstLineLabel = label.padEnd(15, ' '); // "Headers:" + tabs

    if (lines[0] === '<none>') {
        console.log(`${firstLineLabel}${lines[0]}`);
        return;
    }
    console.log(`${firstLineLabel}${lines[0]}`);
    for (let i = 1; i < lines.length; i++) {
        console.log(`${''.padEnd(15, ' ')}${lines[i]}`); // Align subsequent lines
    }
}

function logApiCall(logDetails) {
    console.log("\n-------------------- API LOG START --------------------");
    console.log(`Request method:\t${logDetails.request.method.toUpperCase()}`);
    console.log(`Request URI:\t${logDetails.request.url}`);
    console.log(`Proxy:\t\t\t${logDetails.request.proxy || '<none>'}`);
    console.log(`Request params:\t<none>`); // Often covered by Query or Path
    console.log(`Query params:\t${logDetails.request.queryParams || '<none>'}`);
    console.log(`Form params:\t${logDetails.request.formParams || '<none>'}`);
    console.log(`Path params:\t<none>`); // Incorporated into Request URI
    printFormattedHeaders('Headers:', formatHeadersForLog(logDetails.request.headers));
    console.log(`Cookies:\t\t${logDetails.request.cookies || '<none>'}`); // Extracted from request headers
    console.log(`Multiparts:\t\t${logDetails.request.multiparts || '<none>'}`);
    console.log(`Body:\n${logDetails.request.body}`);

    if (logDetails.response) {
        console.log(`\n${logDetails.response.statusLine}`);
        printFormattedHeaders('Headers:', formatHeadersForLog(logDetails.response.headers));
        // Cookies for response are part of Set-Cookie in headers
        console.log(`Body:\n${formatBodyForLog(logDetails.response.body)}`);
    } else if (logDetails.error) {
        console.log(`\nError:\t\t${logDetails.error.message}`);
        if (logDetails.error.response) {
            console.log(`${logDetails.error.response.statusLine}`);
            printFormattedHeaders('Headers:', formatHeadersForLog(logDetails.error.response.headers));
            console.log(`Body:\n${formatBodyForLog(logDetails.error.response.body)}`);
        }
    }
    console.log("-------------------- API LOG END ----------------------\n");
}

axios.interceptors.request.use(config => {
    const logDetails = { request: {} };

    logDetails.request.method = config.method?.toUpperCase() || 'GET';
    // Use axios.getUri(config) if available and preferred, otherwise build manually
    let fullUrl = config.url;
    if (config.baseURL && !config.url.startsWith('http')) {
        fullUrl = new URL(config.url, config.baseURL).toString();
    }
    if (config.params) {
        const params = new URLSearchParams(config.params).toString();
        if (params) {
            fullUrl += (fullUrl.includes('?') ? '&' : '?') + params;
        }
    }
    logDetails.request.url = fullUrl;

    const urlObj = new URL(logDetails.request.url);
    logDetails.request.queryParams = urlObj.search ? urlObj.search.substring(1) : '<none>';

    // Clone headers. Axios normalizes header keys to lowercase.
    logDetails.request.headers = { ...config.headers };
    logDetails.request.cookies = config.headers.cookie || '<none>'; // Axios uses lowercase 'cookie'
    logDetails.request.proxy = config.proxy ? `${config.proxy.host}:${config.proxy.port}` : '<none>';

    const contentType = config.headers['content-type'] || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
        logDetails.request.formParams = typeof config.data === 'string' ? config.data : new URLSearchParams(config.data).toString();
        logDetails.request.body = logDetails.request.formParams;
    } else if (contentType.includes('multipart/form-data') && config.data instanceof FormData) {
        const keys = [];
        for (const key of config.data.keys()) { keys.push(key); }
        logDetails.request.multiparts = `FormData with keys: ${keys.join(', ')}`;
        logDetails.request.body = `[FormData with keys: ${keys.join(', ')}]`;
    } else {
        logDetails.request.body = formatBodyForLog(config.data);
    }

    config.meta = config.meta || {};
    config.meta.logDetails = logDetails;

    return config;
}, error => {
    const logDetails = {
        request: {
            method: error.config?.method?.toUpperCase() || 'UNKNOWN',
            url: error.config?.url || 'UNKNOWN URL',
            headers: error.config?.headers || {},
            body: formatBodyForLog(error.config?.data),
            queryParams: error.config?.params ? new URLSearchParams(error.config.params).toString() : '<none>',
        },
        error: { message: `Request setup error: ${error.message}` }
    };
    logApiCall(logDetails);
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    const logDetails = response.config.meta.logDetails;
    logDetails.response = {
        statusLine: `HTTP/${response.request?.httpVersion || '1.1'} ${response.status} ${response.statusText}`,
        headers: response.headers, // Axios response headers are plain objects
        body: response.data,
    };
    logApiCall(logDetails);
    return response;
}, error => {
    const logDetails = error.config?.meta?.logDetails || { request: { url: error.config?.url || 'UNKNOWN URL', method: error.config?.method?.toUpperCase() || 'UNKNOWN', headers: {}, body: '<unknown>' } };
    logDetails.error = { message: error.message };
    if (error.response) {
        logDetails.error.response = {
            statusLine: `HTTP/${error.response.request?.httpVersion || '1.1'} ${error.response.status} ${error.response.statusText}`,
            headers: error.response.headers,
            body: error.response.data,
        };
    }
    logApiCall(logDetails);
    return Promise.reject(error);
});