/**
 * Check if required parameters are missing for readMessages event
 */

function checkRequiredParams({ roomId, unreadMessages }) {
    console.log('Checking required readMessages params...');
    if (!roomId || roomId === '') {
        console.log('Missing roomId');
        return {
            errorMessage: 'Missing roomId',
            paramsExist: false,
        };
    }

    if (!unreadMessages) {
        console.log('Missing unreadMessages');
        return {
            errorMessage: 'Missing unreadMessages',
            paramsExist: false,
        };
    }

    console.log('All required readMessages params exist.');
    return {
        errorMessage: null,
        paramsExist: true,
    };
}

module.exports = {
    checkRequiredParams,
};
