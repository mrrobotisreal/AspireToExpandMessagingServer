/**
 * Check if required parameters are missing for listMessages event
 */

function checkRequiredParams({ roomId }) {
    console.log('Checking required listMessages params...');
    if (!roomId || roomId === '') {
        console.log('Missing roomId');
        return {
            errorMessage: 'Missing roomId',
            paramsExist: false,
        };
    }

    console.log('All required listMessages params exist.');
    return {
        errorMessage: null,
        paramsExist: true,
    };
}

module.exports = {
    checkRequiredParams,
};
