/**
 * Check if required parameters are missing for registerUser event
 * NOTE: The profilePictureUrl parameter is not required, so it is not checked here
 */
function checkRequiredParams({
    userId,
    userType,
    preferredName,
    firstName,
    lastName,
}) {
    console.log('Checking required registerUser params...');
    if (!userId || userId === '') {
        console.log('Missing userId');
        return {
            errorMessage: 'Missing userId',
            paramsExist: false,
        };
    }

    if (!userType || userType === '') {
        console.log('Missing userType');
        return {
            errorMessage: 'Missing userType',
            paramsExist: false,
        };
    }

    if (!preferredName || preferredName === '') {
        console.log('Missing preferredName');
        return {
            errorMessage: 'Missing preferredName',
            paramsExist: false,
        };
    }

    if (!firstName || firstName === '') {
        console.log('Missing firstName');
        return {
            errorMessage: 'Missing firstName',
            paramsExist: false,
        };
    }

    if (!lastName || lastName === '') {
        console.log('Missing lastName');
        return {
            errorMessage: 'Missing lastName',
            paramsExist: false,
        };
    }

    console.log('All required registerUser params exist.');
    return {
        errorMessage: null,
        paramsExist: true,
    };
}

module.exports = {
    checkRequiredParams,
};
