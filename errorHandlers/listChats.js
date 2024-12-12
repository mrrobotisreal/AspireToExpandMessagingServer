/**
 * Check if required parameters are missing for listChats event
 */

function checkRequiredParams({ userId }) {
    console.log('Checking required listChats params...');
    if (!userId || userId === '') {
        console.log('Missing userId');
        return {
            errorMessage: 'Missing userId',
            paramsExist: false,
        };
    }

    console.log('All required listChats params exist.');
    return {
        errorMessage: null,
        paramsExist: true,
    };
}

module.exports = {
    checkRequiredParams,
};
