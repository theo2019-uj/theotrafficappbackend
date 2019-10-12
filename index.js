// Import dependencies
const admin = require('firebase-admin');
const firebase = require('firebase');
const app = require('firebase-app');
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
// const firebaseHelper = require('firebase-functions-helper');
// const express = require('express');
// const bodyParser = require("body-parser");

admin.initializeApp(functions.config().firebase);

const firebaseConfig = {
    apiKey: "AIzaSyBW9VyBNO_rn-bnPXoHi5WWQ-5u5qEsuBg",
    authDomain: "the-o-2019.firebaseapp.com",
    databaseURL: "https://the-o-2019.firebaseio.com",
    projectId: "the-o-2019",
    storageBucket: "the-o-2019.appspot.com",
    messagingSenderId: "204675194132",
    appId: "1:204675194132:web:a5bd00eef61a016e"
};

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

let vehicleReference = 'vehicleInformation/';
let roadUsersReference = 'users/roadUsers/individuals/';
let authorizingPersonnelReference = 'official/authorizingPersonnel/';
let metroPoliceReference = 'official/metroPolice/';
let accidentReportPrimaryInfoReference = 'accidentReports/';

exports.getRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserId = request.query.roadUserIdNumber;

        db.doc(roadUsersReference + roadUserId).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const data = snapshot.data();
                    response.send(data);
                }
                else {
                    return response.status('202').json({
                        message: 'Unable to retrieve your information.'
                    })
                }
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            });
    });
});

exports.getVehicleDetailsByVehicleId = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const vehicleUIdNum = request.query.vehicleUID;

        db.doc(vehicleReference + vehicleUIdNum).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const data = snapshot.data();
                    response.send(data);
                }
                else {
                    return response.send('Vehicles not available');
                }
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            });
    });
})

exports.getListOfVehiclesByRoadUserId = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserIdNumber = request.query.roadUserIdNumber;

        db.doc(roadUsersReference + roadUserIdNumber).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const data = snapshot.data().ownerVehicles
                    response.send(data)
                }
                else {
                    return response.send('Road user with the ID number does not exist');
                }
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            });
    });
})

exports.getListOfAccidents = functions.https.onRequest((request, response) => {

});

exports.updateAccidentReportStatus = functions.https.onRequest((request, response) => {

});

exports.createAccidentReport = functions.https.onRequest((request, response) => {

});

exports.registerRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const email = request.body.username;
        const password = request.body.password;

        if (!email) {
            return response.status(400).json({
                message: "Unable to process request. Email is missing."
            });
        }
        if (!password) {
            return response.status(400).json({
                message: "Unable to process request. Password is missing."
            });
        }
        if (!email.empty && !password.empty) {
            admin.auth().createUser({
                email: request.body.username,
                emailVerified: false,
                phoneNumber: request.body.cellPhoneNumber,
                password: request.body.password,
                displayName: request.body.displayName,
                disabled: false
            })
                .then(response.status(200).json({
                    message: "Registration successful."
                }))
                .catch(function (error) {
                    console.log(error.code + ": " + error.message);
                });
        }
        else {

            return response.status(202).json({
                message: 'The request that was sent is invalid. Minimum information required is invalid to register user.'
            })
        }
    });
});

exports.updateUserDetails = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const requestData = request.body;

        const roadUserIdNumber = request.body.roadUserIdNumber;
        delete requestData.roadUserIdNumber;
        // const cellPhoneNumber = request.body.cellPhoneNumber;
        // const telephoneAtHome = request.body.telephoneAtHome;
        // const countryCode = request.body.countryCode;
        // const contactTelephoneNumber = request.body.contactTelephoneNumber;
        // const emailAddress = request.body.emailAddress;
        // const cityOrTown = request.body.cityOrTown
        // const dateOfBirth = request.body.dateOfBirth
        // const firstNames = request.body.firstNames
        // const gender = request.body.gender
        // const initials = request.body.initials
        // const licenseCode = request.body.licenseCode
        // const licenseDateOfExpiry = request.body.licenseDateOfExpiry
        // const licenseDateOfIssue = request.body.licenseDateOfIssue
        // const licenseNumber = request.body.licenseNumber
        // const noticeDeliveryToPostalAddress = request.body.noticeDeliveryToPostalAddress
        // const postalAddress1 = request.body.postalAddress1
        // const postalAddress2 = request.body.postalAddress2
        // const postalAddress3 = request.body.postalAddress3
        // const postalAddressCode = request.body.postalAddressCode
        // const streetAddress1 = request.body.streetAddress1
        // const streetAddress2 = request.body.licenseNumber
        // const streetAddress3 = request.body.streetAddress3
        // const suburb = request.body.suburb
        // const surname = request.body.surname

        // Gets data from the request which will be used to add to the POST service

        if (!requestData.empty) {
            admin.firestore().doc(roadUsersReference + roadUserIdNumber).update(requestData)
                .then(() => {
                    response.send('Success.');
                })
                .catch(error => {
                    console.log(error)
                    response.status(500).send(error)
                })
        }
        else {
            response.status(202).send('Request could not be processed as there is not data to be updated.');
        }
    });
});

exports.storeUserDetails = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserIdNumber = request.body.roadUserIdNumber;
        const cellPhoneNumber = request.body.cellPhoneNumber;
        const telephoneAtHome = request.body.telephoneAtHome;
        const countryCode = request.body.countryCode;
        const contactTelephoneNumber = request.body.contactTelephoneNumber;
        const emailAddress = request.body.emailAddress;

        // const cityOrTown = request.body.cityOrTown
        // const dateOfBirth = request.body.dateOfBirth
        // const firstNames = request.body.firstNames
        // const gender = request.body.gender
        // const initials = request.body.initials
        // const licenseCode = request.body.licenseCode
        // const licenseDateOfExpiry = request.body.licenseDateOfExpiry
        // const licenseDateOfIssue = request.body.licenseDateOfIssue
        // const licenseNumber = request.body.licenseNumber
        // const noticeDeliveryToPostalAddress = request.body.noticeDeliveryToPostalAddress
        // const postalAddress1 = request.body.postalAddress1
        // const postalAddress2 = request.body.postalAddress2
        // const postalAddress3 = request.body.postalAddress3
        // const postalAddressCode = request.body.postalAddressCode
        // const streetAddress1 = request.body.streetAddress1
        // const streetAddress2 = request.body.licenseNumber
        // const streetAddress3 = request.body.streetAddress3
        // const suburb = request.body.suburb
        // const surname = request.body.surname

        // Gets data from the request which will be used to add to the POST service
        const roadUserInformation = {
            cellPhoneNumber: request.body.cellPhoneNumber,
            contactTelephoneNumber: request.body.contactTelephoneNumber,
            countryCode: request.body.countryCode,
            emailAddress: request.body.emailAddress,
            telephoneAtHome: request.body.telephoneAtHome
        };

        admin.firestore().doc(roadUsersReference + roadUserIdNumber).update(roadUserInformation)
            .then(() => {
                response.send('Registration successful.');
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            })
    });
});

function sendVerificationEmail() {
    firebase.auth().currentUser.sendEmailVerification().then(function () {
    })
}

exports.validateLoginCredentials = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const email = request.body.email;
        const password = request.body.password;

        if (email.length === null) {
            return response.status(202).send('Email address is short.');
        }
        if (password.length < 4) {
            return response.status(202).send('Password is short.');
        }

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(credentials => {

                return response.status(200).json({
                    userUID: credentials.user.uid,
                    displayName: credentials.user.displayName,
                    photoURL: credentials.user.photoURL,
                    email: credentials.user.email,
                    emailVerified: credentials.user.emailVerified,
                    phoneNumber: credentials.user.phoneNumber,
                    refreshToken: credentials.user.refreshToken,
                    verifyEmailAddress: credentials.user.emailVerified
                });
            })
            .catch(function (error) {
                var errorCode = error.code;

                if (errorCode === 'auth/wrong-password') {
                    return response.status(202).send('Email address or password incorrect');
                }
                if (errorCode === 'auth/user-disabled') {
                    return response.status(202).send('User has been disabled. Contact IT support.');
                }
                if (errorCode === 'auth/user-not-found') {
                    return response.status(202).send('Email address or password incorrect');
                }
                if (errorCode === 'auth/invalid-email') {
                    return response.status(202).send('Email address or password incorrect');
                }
            });

    });
});

exports.signOutCurrentUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        firebase.auth().signOut
            .then(() => {
                response.status("200").send('User signed out.');
            });
    });
});

exports.getCurrentUserLoggedIn = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                response.status(200).send(user);
            }
            else {
                response.status(200).send('User logged out');
            }
        });
    });
});

exports.getCurrentUserLoggedIn = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                response.status(200).send(user);
            }
            else {
                response.status(200).send('User logged out');
            }
        });
    });
});

const createNotification = (notification => {
    return admin.firestore().collection('accidentNotifications')
        .add(notification)
        .then(doc => console.log('Notification added', doc))
});

exports.accidentReportCreated = functions.firestore.document('accidentReports/{accidentReportId}').onCreate(doc => {
    let documentRef = db.collection('accidentReports').doc(doc.id);
    let accidentDoc = documentRef.get()
        .then(doc => {
            accidentData = doc.data();
            const notification = {
                content: "New accident report created",
                user: `${accidentData.completedByInitials} ${accidentData.completedBySurname}`,
                timeCreate: admin.firestore.FieldValue.serverTimestamp(),
                accidentReference: accidentData.accidentRegisterNumber
            }
            return createNotification(notification);
        })
});

function addPrimaryAccidentReportDetails(accidentReportData, accidentRefNumber) {

    if (accidentReportData.formCompletedBy == 'Driver') {
        const createdByRoadUser = {
            accidentDate: accidentReportData.accidentDate,
            accidentRegisterNumber: accidentRefNumber,
            accidentCapturingNumber: accidentReportData.accidentCapturingNumber,
            casNumber: "",
            completedByDate: accidentReportData.completedByDate,
            completedByInitials: accidentReportData.completedByInitials,
            completedByRank: "",
            completedByServiceNumber: "",
            completedBySurname: accidentReportData.completedBySurname,
            completedByTime: accidentReportData.completedByTime,
            dayOfTheWeek: accidentReportData.dayOfTheWeek,
            formCompletedBy: accidentReportData.formCompletedBy,
            numberOfVehiclesInvolved: accidentReportData.numberOfVehiclesInvolved,
            policeStationReported: accidentReportData.policeStationReported,
            timeOfAccident: new Date(accidentReportData.timeOfAccident),
            accidentReportStatus: "Pending Approval"
        }
        return createdByRoadUser;
    }
    else {
        if (accidentReportData.formCompletedBy == 'Police Official') {
            const policeOfficialCreatedAccidentReport = {
                accidentDate: accidentReportData.accidentDate,
                accidentRegisterNumber: accidentRefNumber,
                accidentCapturingNumber: accidentReportData.accidentCapturingNumber,
                casNumber: '',
                completedByDate: accidentReportData.completedByDate,
                completedByInitials: accidentReportData.completedByInitials,
                completedByRank: accidentReportData.completedByRank,
                completedByServiceNumber: accidentReportData.completedByServiceNumber,
                completedBySurname: accidentReportData.completedBySurname,
                completedByTime: accidentReportData.completedByTime,
                dayOfTheWeek: accidentReportData.dayOfTheWeek,
                formCompletedBy: accidentReportData.formCompletedBy,
                hitAndRun: accidentReportData.hitAndRun,
                inspectedByIntials: accidentReportData.inspectedByIntials,
                inspectedBySurname: accidentReportData.inspectedBySurname,
                inspectorRank: accidentReportData.inspectorRank,
                inspectorServiceNumber: accidentReportData.completedByServiceNumber,
                inspectorDateSigned: accidentReportData.inspectorDateSigned,
                nameOfDepartment: accidentReportData.nameOfDepartment,
                numberOfVehiclesInvolved: accidentReportData.numberOfVehiclesInvolved,
                occuranceBook: `${accidentReportData.formCompletedBy}${admin.firestore.FieldValue.serverTimestamp()}`,
                policeStationReported: accidentReportData.policeStationReported,
                timeOfAccident: new Date(accidentReportData.timeOfAccident),
                accidentReportStatus: "Pending Approval"
            };
            return policeOfficialCreatedAccidentReport;
        }
        else {
            return '';
        }
    }
}

function addConditionOfAccident(accidentReportData) {
    if (accidentReportData != '')
    {
        const conditionsOfAccideData = accidentReportData.conditionsOfAccideData;
        return conditionsOfAccideData;
    }
    else {
        return '';
    }
}

function addDriverOrCyclistParticulars(accidentReportData) {
    if (accidentReportData != '')
    {
        const driverOrCyclistParticulars = accidentReportData.driverOrCyclist;
        return driverOrCyclistParticulars;
    }
    else {
        return '';
    }
}

function addLocationDetails(accidentReportData) {
    if (accidentReportData != '')
    {
        const locationDetailsData = accidentReportData.location;
        return locationDetailsData;
    }
    else {
        return '';
    }
}

function addRoadTypeDetails(accidentReportData) {
    if (accidentReportData != '')
    {
        const roadTypeDetails = accidentReportData.roadType;
        return roadTypeDetails;
    }
    else {
        return '';
    }
}

function addSummaryOfPersonsInvolvedDetails(accidentReportData) {
    if (accidentReportData != '')
    {
        const summaryOfPersonsInvolvedDetails = accidentReportData.summaryOfPersonsInvolved;
        return summaryOfPersonsInvolvedDetails;
    }
    else {
        return '';
    }
}

function addVehicleDetails(accidentReportData) {
    if (accidentReportData != '')
    {
        const vehicleDetails = accidentReportData.vehicleDetails;
        return vehicleDetails;
    }
    else {
        return '';
    }
}

function addWitnessInformation(accidentReportData) {
    if (accidentReportData != '')
    {
        const witnessInformation = accidentReportData.witnesses;
        return witnessInformation;
    }
    else {
        return '';
    }
}

exports.createAccidentReport = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        accidentReportData = request.body;

        if (accidentReportData == '') {
            return response.status(404).json({
                message: 'Unable to process an empty request. Please try again.'
            });
        }
        const accidentRefNumber = '';

        let addDoc = db.collection('accidentReports').add({})
            .then(ref => {
                const primaryAccidentReportData = addPrimaryAccidentReportDetails(accidentReportData, ref.id);
                const conditionsOfAccidentData = addConditionOfAccident(accidentReportData);
                const driverOrCyclistParticularsData = addDriverOrCyclistParticulars(accidentReportData);
                const locationDetailsData = addLocationDetails(accidentReportData);
                const roadTypeDetailsData = addRoadTypeDetails(accidentReportData);
                const summaryOfPersonsInvolvedData = addSummaryOfPersonsInvolvedDetails(accidentReportData);
                const vehicleDetailsData = addVehicleDetails(accidentReportData);
                const witnessInformationData = addWitnessInformation(accidentReportData);
                

                if (primaryAccidentReportData != '' || conditionsOfAccidentData != '' || driverOrCyclistParticularsData != '' || locationDetailsData != '' || roadTypeDetailsData != '' || summaryOfPersonsInvolvedData != '' || vehicleDetailsData != '' || witnessInformationData != '') {
                    db.collection('accidentReports').doc(ref.id).update(primaryAccidentReportData);
                    db.collection('accidentReports/' + ref.id + '/accidentDetails').doc('conditionsOfAccident').set(conditionsOfAccidentData)
                    for (let i in driverOrCyclistParticularsData.data)
                    {
                        db.collection('accidentReports').doc(ref.id).collection('accidentDetails').doc('driverOrCyclist').collection('driverOrCyclist'+i).add(driverOrCyclistParticularsData.data[i]);
                    }
                    //db.collection('accidentReports/' + ref.id + '/accidentDetails').doc('conditionsOfAccident').set(conditionsOfAccidentData);

                    if (locationDetailsData.locationType == 'freewayOrRural')
                    {
                        db.collection('accidentReports/' + ref.id + '/accidentDetails').doc('location').set(locationDetailsData.primaryDetails);
                        db.collection('accidentReports').doc(ref.id).collection('accidentDetails').doc('location').collection('freewayOrRural').add(locationDetailsData.locationDetails);
                    }
                    if (locationDetailsData.locationType == 'townOrCity')
                    {
                        db.collection('accidentReports').doc(ref.id).collection('accidentDetails').doc('location').set(locationDetailsData);
                        db.collection('accidentReports').doc(ref.id).collection('accidentDetails').doc('location').collection('townOrCity').add(locationDetailsData.locationDetails);
                    }

                    // db.collection('accidentReports/' + ref.id + '/accidentDetails').doc('summaryOfPersonsInvolved').update(summaryOfPersonsInvolvedData.particularsOfKilledPassengersOrPedestrians);
                    // db.collection('accidentReports/' + ref.id + '/accidentDetails').doc('summaryOfPersonsInvolved').update(summaryOfPersonsInvolvedData.particularsOfPassengersNotInjured);

                    // for (k in vehicleDetailsData)
                    // {
                    //     db.collection('accidentReports/' + ref.id + '/accidentDetails/vehicleDetails').doc(vehicleDetailsData[k].vehicleIdentifierNumber).update(vehicleDetailsData[k]);
                    // }

                    // for (l in witnessInformationData)
                    // {
                    //     db.collection('accidentReports/' + ref.id + '/accidentDetails/witnesses').doc(witnessInformationData[l].witnessIdentifierNumber).update(witnessInformationData[l].witnessDetails);
                    // }

                        // .catch(error => {
                        //     console.log(error);
                        //     response.status(404).json({
                        //         message: 'There was an issue with the data'
                        //     });
                        // });
                }

                response.status("200").json({
                    message: "Accident report successfully created. In case you didn't notice, we have sent you your accident reference number to your cellphone number and email."
                })
            })
            .catch (error => {
                console.log(error);
                response.status(500).json({
                    message: 'There was an issue with the data'
                })
            });

        // const successAddConditionOfAccident = addConditionOfAccident(accidentReportData);
        // const successAddDriverOrCyclist = addDriverOrCyclist(accidentReportData);
        // const successAddLocationDetails = addLocationDetails(accidentReportData);
        // const successAddRoadTypeDetails = addRoadTypeDetails(accidentReportData);
        // const successAddSummaryOfPersonsInvolvedDetails = addSummaryOfPersonsInvolvedDetails(accidentReportData);
        // const successAddVehicleDetails = addVehicleDetails(accidentReportData);
        // const successAddWitnessInformation = addWitnessInformation(accidentReportData);


        // const cityOrTown = request.body.cityOrTown
        // const dateOfBirth = request.body.dateOfBirth
        // const firstNames = request.body.firstNames
        // const gender = request.body.gender
        // const initials = request.body.initials
        // const licenseCode = request.body.licenseCode
        // const licenseDateOfExpiry = request.body.licenseDateOfExpiry
        // const licenseDateOfIssue = request.body.licenseDateOfIssue
        // const licenseNumber = request.body.licenseNumber
        // const noticeDeliveryToPostalAddress = request.body.noticeDeliveryToPostalAddress
        // const postalAddress1 = request.body.postalAddress1
        // const postalAddress2 = request.body.postalAddress2
        // const postalAddress3 = request.body.postalAddress3
        // const postalAddressCode = request.body.postalAddressCode
        // const streetAddress1 = request.body.streetAddress1
        // const streetAddress2 = request.body.licenseNumber
        // const streetAddress3 = request.body.streetAddress3
        // const suburb = request.body.suburb
        // const surname = request.body.surname

        // Gets data from the request which will be used to add to the POST service


        // New comment
    });
});

function getAdminUserData(accidentCreatedBy, userType) {

    admin.firestore.document(metroPoliceReference + accidentCreatedBy).get()
        .then(() => {
            return snapshot.data();
        });
};

exports.createInfringementNoticeForUnattendedVehicle = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const infringementNoticeData = request.body;

        if (infringementNoticeData != '')
        {
            const addedSectionA = addSectionA (infringementNoticeData);
            const addedSectionB = addSectionB (infringementNoticeData);
            const addedSectionC = addSectionC (infringementNoticeData);
            const addedSectionD = addSectionD (infringementNoticeData);
            const addedSectionE = addSectionE (infringementNoticeData);
            const addedSectionF = addSectionF (infringementNoticeData);
        }
    });
});

const createNotificationForInfringement = (notification => {
    return admin.firestore().collection('infrigementNotifications')
        .add(notification)
        .then(doc => console.log('Notification added', doc))
});

exports.infringementNoticeWithoutDriverCreated = functions.firestore.document('infringementNoticeWithoutDriver/{infringementNoticeId}').onCreate(doc => {
    let documentRef = db.collection('infringementNoticeWithoutDriver').doc(doc.id);
    let accidentDoc = documentRef.get()
        .then(doc => {
            infringementData = doc.data();
            const notification = {
                content: "New infringement created",
                policeOfficer: `${infringementData.completedByInitials} ${infringementData.completedBySurname}`,
                timeCreate: admin.firestore.FieldValue.serverTimestamp(),
                infringementNoticeRef: doc.id,
                policeStation: infringementData.policeStation
            }
            return createNotificationForInfringement(notification);
        })
});

function addSectionA (infringementData) {
    
    if (infringementData.typeOfRoadUser == 'individual')
    {
        db.collection('infringementNoticeWithoutDriver').doc().collection('A').add({
            roadUserIdNumber: infringementData.roadUserIdNumber,
            roadUserLicenseNo: infringementData.roadUserLicenseNo,
            roadUserNationality: infringementData.roadUserNationality,
            roadUserPostalCode: infringementData.roadUserPostalCode,
            roadUserResAddress: infringementData.roadUserResAddress,
            roadUserSuburb: infringementData.roadUserSuburb,
            roadUserSuburbCity: infringementData.roadUserSuburbCity,
            roadUserSurname: infringementData.roadUserSurname
        })
    }

    if (infringementData.typeOfRoadUser == 'business')
    {
        db.collection('infringmentNotieWithoutDriver').doc().collection('A').add({
            roadUserBusinessAddress: infringementData.roadUserBusinessAddress,
            roadUserBusinessPostalCode: infringementData.roadUserBusinessPostalCode,
            roadUserBusinessSuburb: infringementData.roadUserBusinessSuburb,
            roadUserIdNumber: infringementData.roadUserIdNumber,
            roadUserLicenseNo: infringementData.roadUserLicenseNo,
            roadUserNationality: infringementData.roadUserNationality,
            roadUserPostalCode: infringementData.roadUserPostalCode,
            roadUserResAddress: infringementData.roadUserResAddress,
            roadUserSuburb: infringementData.roadUserSuburb,
            roadUserSuburbCity: infringementData.roadUserSuburbCity,
            roadUserSurname: infringementData.roadUserSurname
        })
    }
}

function addSectionB (infringementData) {

}

function addSectionC (infringementData) {

}

function addSectionD (infringementData) {

}

function addSectionE (infringementData) {

}

function addSectionF (infringementData) {

}