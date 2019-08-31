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

exports.getRoadUser = functions.https.onRequest((request, response) => {

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
            return response.status(400)({
                message: "Unable to process request. Password is missing."
            });
        }
        if (email && password) {
            admin.auth().createUser({
                email: request.body.username,
                emailVerified: request.body.emailVerificationIndicator,
                phoneNumber: request.body.cellPhoneNumber,
                password: request.body.password,
                displayName: request.body.displayName,
                disabled: request.body.disabilityIndicator
            })
                .then(response.status(200).json({
                    message: "Registration successful."
                }))
                .catch(function (error) {
                    console.log(error.code + ": " + error.message);
                });
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
                    response.send('Registration successful.');
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
            telephoneAtHome: request.body.telephoneAtHome,
        };

        // New comment
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

exports.validateLoginCredentials = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const email = request.body.email;
        const password = request.body.password;

        if (email.length < 4) {
            response.status(202).send('Email address is missing.');
            return;
        }
        if (password.length < 4) {
            response.status(202).send('Password is missing.');
            return;
        }

        if (!firebase.auth().currentUser) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(user => {
                    response.status.send(user);
                })
                .catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;

                    if (errorCode === 'auth/wrong-password') {
                        return response.status(202).send('Email address or password incorrect');
                    }
                    if (errorCode === 'auth/user-disabled') {
                        return response.status(202).send('User has been disabled. Contact IT support.');
                    }
                    if (errorCode === 'auth/user-not-found') {
                        return response.status(202).send('User with the credentials provided is not found');
                    }
                    if (errorCode === 'auth/invalid-email') {
                        return response.status(202).send('Email address or password incorrect');
                    }
                });
        }
        else {
            firebase.auth().signOut();
            response.send('User required to sign-in again.');
        }

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
                response.status.send('User signed out.');
            });
    });
});

exports.getCurrentUserLoggedIn = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
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