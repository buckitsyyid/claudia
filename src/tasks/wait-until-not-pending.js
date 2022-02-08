const retry = require('oh-no-i-insist');
const isDebugEnabled = process.env.DEBUG && process.env.DEBUG.includes("claudia-retry");

module.exports = function waitUntilNotPending(lambda, functionName, timeout, retries) {
    'use strict';
    return retry(
        () => {
            return lambda.getFunctionConfiguration({FunctionName: functionName}).promise()
                .then(result => {
                    if (isDebugEnabled)
                        console.error("Retrying.. !!", result);

                    if (result.LastUpdateStatus === 'Failed') {
                        throw `Lambda resource update failed`;
                    }
                    if (result.LastUpdateStatus === 'InProgress') {
                        throw 'Pending';
                    } else {
                        if (isDebugEnabled)
                            console.error("Unknown state!!!", result.LastUpdateStatus)
                    }
                });
        },
        timeout,
        retries,
        (status) => {
            if (isDebugEnabled)
                console.error("Testing retry with status: ", status);

            return (status === 'Pending')
        },
        () => console.log('Lambda function is in Pending state, waiting...'),
        Promise
    );
};


