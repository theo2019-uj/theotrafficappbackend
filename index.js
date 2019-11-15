// Import dependencies
const firebase = require('firebase');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');
const { Storage } = require('@google-cloud/storage');

PDFDocument = require('pdfkit');
// const firebaseHelper = require('firebase-functions-helper');
// const express = require('express');
// const bodyParser = require("body-parser");
let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'theotraffic.info@gmail.com',
        pass: 'TheOTraffic12345'
    }
});

// var stream = PDFDocument.pipe(blobStream());

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

const storage = new Storage(firebaseConfig);
// const infringementStorageRef = storage.ref('gs://the-o-2019.appspot.com/infringementNoticeForUnattendedVehicleImages');

const db = admin.firestore();

let vehicleReference = 'vehicleInformation/';
let roadUsersReference = 'users/roadUsers/individuals/';
let metroPoliceReference = 'official/metroPolice/';

exports.addVehicle = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const vehicleData = request.body;

        db.collection('vehicleInformation').doc(vehicleData.chassisNumberVIN).set(vehicleData)
            .then(() => {
                response.send('Added vehicle successful.');
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            });
    });
});

exports.addRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserData = request.body;

        db.collection('users').doc('roadUsers').collection('individuals').doc(roadUserData.idNumber).set(roadUserData.data)
            .then(() => {
                response.send('Road user successful.');
            })
            .catch(error => {
                console.log(error)
                response.status(500).send(error)
            });
    });
});

exports.getListOfInfringements = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const infringementData = {};

        db.collection('roadTrafficInfringement').get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        infringementData[doc.id] = doc.data();
                    })
                    response.status(200).send(infringementData);
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
                    const data = {
                        idNumber: snapshot.id,
                        data: snapshot.data()
                    };
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
});

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
});

exports.forgotPassword = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        userEmailAddress = request.body.emailAddress;

        firebase.auth().sendPasswordResetEmail(userEmailAddress)
            .then(function () {
                return response.status(200).send({ message: 'Password has been sent for reset to: ' + userEmailAddress })
            })
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode + ": " + errorMessage);
                if (errorCode == 'auth/user-not-found') {
                    return response.status(202).send({ message: 'User was not found.' });
                }
                if (errorCode == 'auth/invalid-email') {
                    return response.status(202).send({ message: 'Email entered is not a valid email address.' });
                }
            });
    });
});

exports.registerRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const isPoliceOfficer = request.body.isPoliceOfficer;
        const userIdNumber = request.body.idNumber;
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

            if (isPoliceOfficer == true) {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(function (userRecord) {
                        db.collection('users').doc('official').collection('metroPolice').where('idNumber', '==', userIdNumber).get()
                            .then(snapshot => {
                                snapshot.forEach(doc => {
                                    if (doc.data().isRegistered == true) {
                                        return response.status(202).send({ message: 'Police officer already registered. Please contact IT support for assistance.' })
                                    }
                                    else {
                                        db.collection('users').doc('official').collection('metroPolice').doc(doc.id).update({
                                            isRegistered: true,
                                            emailAddress: email,
                                            uid: userRecord.user.uid
                                        });
                                    }
                                })
                                admin.auth().updateUser(userRecord.user.uid, {
                                    phoneNumber: request.body.cellPhoneNumber,
                                    displayName: request.body.displayName,
                                    disabled: false
                                });
                                userRecord.user.sendEmailVerification();
                                return response.status(200).json({
                                    message: "Registration successful. Confirmation of email required."
                                });
                            })
                            .catch(error => {
                                console.log(error);
                                return response.status(400).send({ message: 'An issue was detected while processing your request. Please contact support.' })
                            })
                    })
                    .catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorCode + ": " + errorMessage);
                        if (errorCode == 'auth/weak-password') {
                            return response.status(202).send({ message: 'The password is too weak.' });
                        }
                        if (errorCode == 'auth/email-already-in-use') {
                            return response.status(202).send({ message: 'Email already taken.' });
                        }
                        if (errorCode == 'auth/invalid-email') {
                            return response.status(202).send({ message: 'Email entered is not a valid email address.' });
                        }

                        if (errorCode == 'auth/operation-not-allowed') {
                            return response.status(400).send({ message: 'Invalid operation. Please contact technical support desk.' });
                        }

                    });
            }
            if (isPoliceOfficer == false) {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(function (userRecord) {
                        db.collection('users').doc('roadUsers').collection('individuals').doc(userIdNumber).get()
                            .then(snapshot => {
                                if (!snapshot.empty) {
                                    if (snapshot.data().isRegistered == true) {
                                        return response.status(202).send({ message: 'User already registered. Please contact IT support for assistance.' })
                                    }
                                    else {
                                        db.collection('users').doc('roadUsers').collection('individuals').doc(userIdNumber).update({
                                            isRegistered: true,
                                            emailAddress: email,
                                            uid: userRecord.user.uid
                                        });

                                        admin.auth().updateUser(userRecord.user.uid, {
                                            phoneNumber: request.body.cellPhoneNumber,
                                            displayName: request.body.displayName,
                                            disabled: false
                                        })

                                        userRecord.user.sendEmailVerification();

                                        return response.status(200).json({
                                            message: "Registration successful. Confirmation of email required."
                                        });
                                    }
                                }
                                else {
                                    return response.status(202).send({ message: 'User record not found. Please enter the correct ID number.' })
                                }
                            })
                            .catch(error => {
                                console.log(error);
                                return response.status(400).send({ message: 'An issue was detected while processing your request. Please contact support.' })
                            });
                    })
                    .catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorCode + ": " + errorMessage);
                        if (errorCode == 'auth/weak-password') {
                            return response.status(202).send({ message: 'The password is too weak.' });
                        }
                        if (errorCode == 'auth/email-already-in-use') {
                            return response.status(202).send({ message: 'Email already taken.' });
                        }
                        if (errorCode == 'auth/invalid-email') {
                            return response.status(202).send({ message: 'Email entered is not a valid email address.' });
                        }

                        if (errorCode == 'auth/operation-not-allowed') {
                            return response.status(400).send({ message: 'Invalid operation. Please contact technical support desk.' });
                        }

                    });
            }
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

        const roadUserUID = request.body.uid;
        delete requestData.roadUserIdNumber;

        if (!requestData.empty) {
            db.collection('users').doc('roadUsers').collection('individuals').where("uid", "==", roadUserUID).get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            if (requestData.email != doc.data().emailAddress) {
                                db.collection('users').doc('roadUsers').collection('individuals').doc(doc.id).update(requestData)
                                admin.auth().updateUser(roadUserUID, {
                                    displayName: requestData.firstNames + ' ' + requestData.surname,
                                    email: requestData.email,
                                    emailVerified: false
                                })
                            }
                            if (requestData.email == doc.data().emailAddress) {
                                db.collection('users').doc('roadUsers').collection('individuals').doc(doc.id).update(requestData)
                                admin.auth().updateUser(roadUserUID, {
                                    displayName: requestData.firstNames + requestData.surname
                                })
                            }
                        })
                        response.status(200).send({ message: 'User details updated successfully' });
                    }
                    else {
                        return response.status(400).send({ message: 'User does not exist.' })
                    }
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

exports.validateLoginCredentials = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const email = request.body.email;
        const password = request.body.password;
        const isPoliceOfficer = request.body.isPoliceOfficer;

        if (email.length === null) {
            return response.status(202).send('Email address is short.');
        }
        if (password.length < 4) {
            return response.status(202).send('Password is short.');
        }

        if (isPoliceOfficer == true) {
            db.collection('users').doc('official').collection('metroPolice').where('emailAddress', '==', email).get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            firebase.auth().signInWithEmailAndPassword(email, password)
                                .then(credentials => {
                                    if (doc.data().emailAddress == email) {
                                        if (credentials.user.emailVerified != false) {
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
                                        }
                                        else {
                                            credentials.user.sendEmailVerification();
                                            return response.status(202).send('Email not verified. A confirmation email has been sent again to: ' + credentials.user.email)
                                        }
                                    }
                                    if (doc.data().emailAddress != email) {
                                        return response.status(202).send('User does not have the right privileges to login for this profile. Please contact IT support.');
                                    }
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
                    }
                    else {
                        return response.status(202).send('User does not exist.')
                    }
                })
        }

        if (isPoliceOfficer == false) {
            db.collection('users').doc('roadUsers').collection('individuals').where('emailAddress', '==', email).get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            firebase.auth().signInWithEmailAndPassword(email, password)
                                .then(credentials => {
                                    if (doc.data().emailAddress == email) {
                                        if (credentials.user.emailVerified != false) {
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
                                        }
                                        else {
                                            credentials.user.sendEmailVerification();
                                            return response.status(202).send('Email not verified. A confirmation email has been sent again to: ' + credentials.user.email)
                                        }
                                    }
                                    if (doc.data().emailAddress != email) {
                                        return response.status(202).send('User does not have the right privileges to login for this profile. Please contact IT support.');
                                    }
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
                    }
                    else {
                        return response.status(202).send('User does not exist.')
                    }
                })
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
                response.status("200").send('User signed out.');
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

function addPrimaryAccidentReportDetails(accidentReportData) {

    if (accidentReportData.formCompletedBy == 'Driver') {
        const createdByRoadUser = {
            accidentRegisterNumber: "",
            accidentCapturingNumber: "",
            casNumber: "",
            completedByRank: "",
            completedByServiceNumber: "",
            accidentReportStatus: "Pending Approval"
        };
        return createdByRoadUser;
    }
    else {
        if (accidentReportData.formCompletedBy == 'Admin') {
            const policeOfficialCreatedAccidentReport = {
                accidentDate: accidentReportData.accidentDate,
                accidentRegisterNumber: collectionSize,
                accidentCapturingNumber: accidentReportData.accidentCapturingNumber,
                casNumber: "",
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
    if (accidentReportData.conditionsOfAccidentData != '') {
        const conditionsOfAccideData = accidentReportData.conditionsOfAccidentData;
        return conditionsOfAccideData;
    }
    else {
        return '';
    }
}

function addDriverOrCyclistParticulars(accidentReportData) {
    if (accidentReportData.driverOrCyclist != '') {
        const driverOrCyclistParticulars = accidentReportData.driverOrCyclist;
        return driverOrCyclistParticulars;
    }
    else {
        return '';
    }
}

function addLocationDetails(accidentReportData) {
    if (accidentReportData.location != '') {
        const locationDetailsData = accidentReportData.location;
        return locationDetailsData;
    }
    else {
        return '';
    }
}

function addRoadTypeDetails(accidentReportData) {
    if (accidentReportData.roadType != '') {
        const roadTypeDetails = accidentReportData.roadType;
        return roadTypeDetails;
    }
    else {
        return '';
    }
}

function addJunctionTypeDetails(accidentReportData) {
    if (accidentReportData.junctionType != '') {
        const junctionTypeDetails = accidentReportData.junctionType;
        return junctionTypeDetails;
    }
    else {
        return '';
    }
}

function addSummaryOfPersonsInvolvedDetails(accidentReportData) {
    if (accidentReportData.summaryOfPersonsInvolved != '') {
        const summaryOfPersonsInvolvedDetails = accidentReportData.summaryOfPersonsInvolved;
        return summaryOfPersonsInvolvedDetails;
    }
    else {
        return '';
    }
}

function addVehicleDetails(accidentReportData) {
    if (accidentReportData.vehicleDetails != '') {
        const vehicleDetails = accidentReportData.vehicleDetails;
        return vehicleDetails;
    }
    else {
        return '';
    }
}

function addWitnessInformation(accidentReportData) {
    if (accidentReportData.witnesses != '') {
        const witnessInformation = accidentReportData.witnesses;
        return witnessInformation;
    }
    else {
        return '';
    }
}

function addPhotos(accidentReportData) {
    if (accidentReportData.accidentPhotos != '') {
        const accidentPhotos = accidentReportData.accidentPhotos;
        return accidentPhotos;
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

        db.collection('accidentReports').add({})
            .then(ref => {
                const primaryAccidentReportData = addPrimaryAccidentReportDetails(accidentReportData);
                const conditionsOfAccidentData = addConditionOfAccident(accidentReportData);
                const driverOrCyclistParticularsData = addDriverOrCyclistParticulars(accidentReportData);
                const locationDetailsData = addLocationDetails(accidentReportData);
                const roadTypeDetailsData = addRoadTypeDetails(accidentReportData);
                const junctionTypeDetailsData = addJunctionTypeDetails(accidentReportData);
                const summaryOfPersonsInvolvedData = addSummaryOfPersonsInvolvedDetails(accidentReportData);
                const vehicleDetailsData = addVehicleDetails(accidentReportData);
                const witnessInformationData = addWitnessInformation(accidentReportData);

                if (primaryAccidentReportData != '' || conditionsOfAccidentData != '' || driverOrCyclistParticularsData != '' || locationDetailsData != '' || roadTypeDetailsData != '' || junctionTypeDetailsData != '' || summaryOfPersonsInvolvedData != '' || vehicleDetailsData != '' || witnessInformationData != '') {
                    
                    db.collection('accidentReports').doc(ref.id).update(primaryAccidentReportData);
                    db.collection('accidentReports').doc(ref.id).update(accidentReportData);
                }

                admin.auth().getUser(accidentReportData.creatorUID)
                    .then(function (userRecord) {
                        const mailOptions = {
                            from: 'The O Traffic Info <theotraffic.info@gmail.com>', 
                            to: userRecord.email,
                            subject: 'Accident Report Created: ' + ref.id, 
                            html: `<body aria-readonly="false"><font face="arial, helvetica, sans-serif">Dear ${userRecord.displayName},<br />
                        <br />
                        Your accident report has been created successfully.<br />
                        <br />
                        The following primary information was added:
                        <br />
                        <br />
                        Accident Date: <strong>${accidentReportData.accidentDate}</strong>
                        <br />
                        Date Report Was Completed: <strong>${accidentReportData.completedByDate}</strong>
                        <br />
                        Time Accident Report Was Completed: <strong>${accidentReportData.completedByTime}</strong>
                        <br />
                        Number of Vehicles Involved: <strong>${accidentReportData.numberOfVehiclesInvolved}</strong>
                        <br />
                        Time Accident Occured: <strong>${accidentReportData.timeOfAccident}</strong>
                        <br />
                        Accident Report Status: <strong>${primaryAccidentReportData.accidentReportStatus}</strong>
                        <br />
                        <br />
                        Please note the following reference number: <strong>${ref.id}</strong></font><br />
                        <br />
                        <span style="font-family:arial,helvetica,sans-serif">You are required to go to <strong>${accidentReportData.policeStationReported}</strong> and present this email to the police officer, who will approve the accident on the system. You will subsequently receive another email with the case number for your convenience.<br />
                        <br />
                        --<br />
                        Yours in safety,<br />
                        The-O Traffic</span></body>` // email content in HTML
                        };

                        transport.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                response.status(400).json({
                                    message: 'An issue was detected while processing your request. Please contact support.'
                                });
                            }
                            else {
                                response.status(200).json({
                                    message: "Accident report successfully created. In case you didn't notice, we have sent you your accident reference number to your email address."
                                });
                            }
                        });
                    });
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({
                    message: 'There was an issue with the data'
                });
            });
    });
});

function getAdminUserData(accidentCreatedBy, userType) {

    admin.firestore.document(metroPoliceReference + accidentCreatedBy).get()
        .then(() => {
            return snapshot.data();
        });
}

function getVehicleData(infringementNoticeData) {
    let vehicleInfo = db.collection('vehicleInformation').where('vehicleRegistrationNumber', '==', infringementNoticeData.vehicleRegistrationNumber).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const vehicleData = ({
                    id: doc.id,
                    data: doc.data()
                });
                return vehicleData;
            });
        })
}

function getOwnerOfVehicle(chassisNumber) {

    const vehicleData = db.collection('users').doc('roadUsers').collection('individuals').where('ownerVehicles', 'array-contains', chassisNumber).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const vehicleOwnerData = ({
                    id: doc.id,
                    data: doc.data()
                });
                return vehicleOwnerData;
            })
        })
    return vehicleData;
}

function getOfficerDetails(officerInfrastructureNumber) {
    db.collection('users').doc('official').collection('metroPolice').where('infrastructureNumber', '==', officerInfrastructureNumber).get()
        .then(snapshot => {
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    return doc.data();
                })
            }
            return '';
        })
}

exports.createInfringementNoticeForUnattendedVehicle = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const infringementNoticeData = request.body;
        db.collection('vehicleInformation').where('vehicleRegistrationNumber', '==', infringementNoticeData.vehicleRegistrationNumber).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const vehicleData = ({
                            id: doc.id,
                            data: doc.data()
                        });
                        if (vehicleData == '') {
                            response.status(400).send({ message: 'Vehicle was not found with the supplied vehicle registration number. Please ensure that the correct registration number is entered.' });
                            return false
                        }
                        db.collection('users').doc('roadUsers').collection('individuals').where('ownerVehicles', 'array-contains', vehicleData.data.chassisNumberVIN).get()
                            .then(snapshot => {
                                if (!snapshot.empty) {
                                    snapshot.forEach(doc => {
                                        const vehicleOwnerData = ({
                                            id: doc.id,
                                            data: doc.data()
                                        });

                                        if (vehicleOwnerData == '') {
                                            response.status(400).send({ message: 'Owner of the vehicle for vehicle with registration number entered was not found. Investigation required.' });
                                            return false
                                        }
                                        db.collection('infringementNoticeWithoutDriver').add({})
                                            .then(ref => {
                                                db.collection('infringementNoticeWithoutDriver').doc().set({
                                                    infringementDate: infringementNoticeData.infringementDate,
                                                    infringementTime: infringementNoticeData.infringementTime,
                                                    suburb: infringementNoticeData.suburb,
                                                    streetA: infringementNoticeData.streetA,
                                                    streetB: infringementNoticeData.streetB,
                                                    genLocation: infringementNoticeData.genLocation,
                                                    vehicleLicenseNo: vehicleData.data.licenseNumber,
                                                    licenseDiskNo: infringementNoticeData.vehicleRegistrationNumber,
                                                    vehicleMake: vehicleData.data.make,
                                                    issuingAuthority: infringementNoticeData.issuingAuthority,
                                                    officerInfrastructureNumber: infringementNoticeData.officerInfrastructureNumber,
                                                    charges: {
                                                        data: infringementNoticeData.charges.data
                                                    },
                                                    metroPolicePersonnelNumber: infringementNoticeData.metroPolicePersonnelNumber,
                                                    ownerIdNumber: vehicleOwnerData.id,
                                                    ownerLicenseNumber: vehicleOwnerData.data.licenseNumber,
                                                    infringementNoticeId: ref.id,
                                                    userUID: vehicleOwnerData.data.uid
                                                });
                                                const mailOptions = {
                                                    from: 'The O Traffic Info <theotraffic.info@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
                                                    to: vehicleOwnerData.data.emailAddress,
                                                    subject: 'Infringement For Unattended Vehicle: ' + ref.id, // email subject
                                                    html: `<body aria-readonly="false"><font face="arial, helvetica, sans-serif">Dear ${vehicleOwnerData.data.firstNames} ${vehicleOwnerData.data.surname},<br />
                                                <br />
                                                You have received a infringement for leaving your vehicle unattended and have violated traffic law.<br />
                                                <br />
                                                Please note the following reference number: <strong>${ref.id}</strong></font><br />
                                                <br />
                                                <span style="font-family:arial,helvetica,sans-serif">You are required to go to any <strong>${infringementNoticeData.issuingAuthority}</strong> and present this email to the police officer, who will assist you if you have any queries.<br />
                                                <br />
                                                --<br />
                                                Yours in safety,<br />
                                                The-O Traffic</span></body>` // email content in HTML
                                                };

                                                transport.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        console.log(error);
                                                        return response.status(400).json({
                                                            message: 'An issue was detected while processing your request. Please contact support.'
                                                        });
                                                    }
                                                    else {
                                                        response.send({ message: 'Infringement successfully created and email sent to the owner of the vehicle.' })
                                                        return true;
                                                    }
                                                });
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                return response.status(500).send(error);
                                            });
                                    });
                                }
                            })
                            .catch(error => {
                                console.log(error);
                                return response.status(400).send(error);
                            })

                    })
                }
                else {
                    return response.status(400).send({ message: 'There was an issue processing your request. Please contact IT support.' })
                }
            })
            .catch(error => {
                console.log(error);
                return response.status(400).send(error);
            });
    });
});

exports.getListOfAccidents = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const listOfAccidents = {};

        db.collection('accidentReports').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    listOfAccidents[doc.id] = doc.data();
                });
                response.status(200).send(listOfAccidents);
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({
                    message: 'Something went wrong. Please contact service provider.'
                });
            });
    });
});

exports.getAccidentById = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        let accidentUID = request.query.accidentUID;

        db.collection('accidentReports').doc(accidentUID).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const detailsOfAccident = {
                        id: snapshot.id,
                        data: snapshot.data()
                    };
                    response.status(200).send(detailsOfAccident);
                }
                else {
                    response.status(201).json({
                        message: 'Accident report was not found.'
                    });
                }
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({
                    message: 'Something went wrong. Please contact service provider.'
                });
            });
    });
});

exports.getAccidentsByCreatorUID = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        let creatorUID = request.query.creatorUID;
        const accidentsByCreatorIdData = {};

        db.collection('accidentReports').where('creatorUID', '==', creatorUID).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        accidentsByCreatorIdData[doc.id] = doc.data();
                    });
                    response.status(200).send(accidentsByCreatorIdData);
                }
                else {
                    response.status(201).json({
                        message: 'Accident report was not found.'
                    });
                }
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({
                    message: 'Something went wrong. Please contact service provider.'
                });
            });
    });
});

exports.approveOrDecline = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const approveOrDeclineData = request.body;

        db.collection('accidentReports').get()
            .then(snapshot => {
                var accidentReportsSize = snapshot.size;
                infringementSize = accidentReportsSize + 1;

                accidentRegisterNumber = infringementSize;

                db.collection('users').doc('official').collection('metroPolice').where('uid', '==', approveOrDeclineData.completedByUserUID).get()
                    .then(snapshot => {
                        if (!snapshot.empty) {
                            if (approveOrDeclineData.approvalIndicator == true) {

                                db.collection('accidentReports').doc(approveOrDeclineData.accidentUID).get()
                                    .then(snapshot => {

                                        if (snapshot.data() != '') {

                                            const primaryAccidentData = snapshot.data();

                                            db.collection('accidentReports').doc(approveOrDeclineData.accidentUID).update({
                                                accidentRegisterNumber: accidentRegisterNumber,
                                                completedByUID: approveOrDeclineData.completedByUserUID,
                                                casNumber: (new Date().toLocaleDateString() + '/' + accidentRegisterNumber),
                                                accidentReportStatus: 'Approved',
                                                dateUpdated: admin.firestore.FieldValue.serverTimestamp()
                                            });

                                            var casNumber = new Date().toLocaleDateString() + '/' + accidentRegisterNumber;

                                            admin.auth().getUser(primaryAccidentData.creatorUID)
                                                .then(function (userRecord) {
                                                    const mailOptions = {
                                                        from: 'The O Traffic Info <theotraffic.info@gmail.com>', // email from
                                                        to: userRecord.email,
                                                        subject: 'Accident Report Approved: ' + approveOrDeclineData.accidentUID, // email subject
                                                        html: `<body aria-readonly="false"><font face="arial, helvetica, sans-serif">Dear ${userRecord.displayName},<br />
                                                    <br />
                                                    Accident report successfully approved.<br />
                                                    <br />
                                                    Please note the following as case number: <strong>${casNumber}</strong></font><br />
                                                    <br />
                                                    <span style="font-family:arial,helvetica,sans-serif">This accident was reported at: ${primaryAccidentData.policeStationReported} and for your convenience, we have attached a pdf document of the accident report.<br />
                                                    <br />
                                                    --<br />
                                                    Yours in safety,<br />
                                                    The-O Traffic</span></body>` // email content in HTML
                                                    };
                                                    transport.sendMail(mailOptions, (error, info) => {
                                                        if (error) {
                                                            console.log(error);
                                                            response.status(400).json({
                                                                message: 'An issue was detected while processing your request. Please contact support.'
                                                            });
                                                        }
                                                        else {
                                                            response.status(200).json({
                                                                message: "Accident report successfully created. In case you didn't notice, we have sent you your accident reference number to your email address."
                                                            });
                                                        }
                                                    });
                                                    response.status(200).json({
                                                        message: 'Successfully approved accident report.'
                                                    })
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                    response.status(500).json({
                                                        message: 'Something went wrong. Please contact service provider.'
                                                    });
                                                });
                                        }
                                        else {
                                            return response.status(400).send({ message: 'Accident report does not exist. Please ensure that the correct reference number is entered.' })
                                        }
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        response.status(500).json({
                                            message: 'Something went wrong. Please contact service provider.'
                                        });
                                    });
                            }
                            else {
                                db.collection('accidentReports').doc(approveOrDeclineData.accidentUID).update({
                                    accidentRegisterNumber: accidentRegisterNumber,
                                    completedByUserUID: approveOrDeclineData.completedByUserUID,
                                    casNumber: (accidentRegisterNumber + ' / ' + new Date().getDate()),
                                    dateUpdated: admin.firestore.FieldValue.serverTimestamp(),
                                    accidentReportStatus: 'Declined',
                                    declineReason: approveOrDeclineData.declineReason
                                });

                                db.collection('accidentReports').doc(approveOrDeclineData.accidentUID).get()
                                    .then(snapshot => {

                                        if (snapshot.data() != '') {

                                            const primaryAccidentData = snapshot.data();

                                            db.collection('accidentReports').doc(approveOrDeclineData.accidentUID).update({
                                                accidentRegisterNumber: accidentRegisterNumber,
                                                completedByUserUID: approveOrDeclineData.completedByUserUID,
                                                casNumber: (accidentRegisterNumber + ' / ' + new Date().getDate()),
                                                dateUpdated: admin.firestore.FieldValue.serverTimestamp(),
                                                accidentReportStatus: 'Declined',
                                                declineReason: approveOrDeclineData.declineReason
                                            });

                                            admin.auth().getUser(primaryAccidentData.creatorUID)
                                                .then(function (userRecord) {
                                                    const mailOptions = {
                                                        from: 'The O Traffic Info <theotraffic.info@gmail.com>', // email from
                                                        to: userRecord.email,
                                                        subject: 'Accident Report Approved: ' + ref.id, // email subject
                                                        html: `<body aria-readonly="false"><font face="arial, helvetica, sans-serif">Dear ${userRecord.displayName},<br />
                                                    <br />
                                                    Accident report was declined.<br />
                                                    <br />
                                                    Please note the following as case number: <strong>${primaryAccidentData.casNumber}</strong></font><br />
                                                    <br />
                                                    <span style="font-family:arial,helvetica,sans-serif">This accident was reported at: ${primaryAccidentData.policeStationReported} and for your convenience, we have attached a pdf document of the accident report.<br />
                                                    <br />
                                                    --<br />
                                                    Yours in safety,<br />
                                                    The-O Traffic</span></body>` // email content in HTML
                                                    };
                                                    transport.sendMail(mailOptions, (error, info) => {
                                                        if (error) {
                                                            console.log(error);
                                                            response.status(400).json({
                                                                message: 'An issue was detected while processing your request. Please contact support.'
                                                            });
                                                        }
                                                        else {
                                                            response.status(200).json({
                                                                message: "Accident report successfully created. In case you didn't notice, we have sent you your accident reference number to your email address."
                                                            });
                                                        }
                                                    });
                                                    response.status(200).json({
                                                        message: 'Successfully approved accident report.'
                                                    })
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                    response.status(500).json({
                                                        message: 'Something went wrong. Please contact service provider.'
                                                    });
                                                });
                                        }
                                        else {
                                            return response.status(400).send({ message: 'Accident report does not exist. Please ensure that the correct reference number is entered.' })
                                        }
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        response.status(500).json({
                                            message: 'Something went wrong. Please contact service provider.'
                                        });
                                    });
                            }
                        }
                        else {
                            return response.status(202).send({ message: 'You are not authorized to process approve this accident report.' })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        response.status(400).json({
                            message: 'Something went wrong. Please contact service provider.'
                        });
                    });
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({
                    message: 'Something went wrong. Please contact service provider.'
                });
            });
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

function addSectionA(infringementData) {
    if (infringementData.sectionA != '') {
        return infringementData.sectionA;
    }
    else {
        return '';
    }
}

function addSectionB(infringementData) {
    if (infringementData.sectionB != '') {
        return infringementData.sectionB;
    }
    else {
        return '';
    }
}

function addSectionC(infringementData) {
    if (infringementData.sectionC != '') {
        return infringementData.sectionC;
    }
    else {
        return '';
    }
}

function addSectionD(infringementData) {
    if (infringementData.sectionD != '') {
        return infringementData.sectionD;
    }
    else {
        return '';
    }
}

function addSectionE(infringementData) {
    if (infringementData.sectionE != '') {
        return infringementData.sectionE;
    }
    else {
        return '';
    }
}

function addSectionF(infringementData) {
    if (infringementData.sectionF != '') {
        return infringementData.sectionF;
    }
    else {
        return '';
    }
}

exports.createWrittenInfringementNotice = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "POST") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const infringementNoticeData = request.body;

        sectionAData = addSectionA(infringementNoticeData);
        sectionBData = addSectionB(infringementNoticeData);
        sectionCData = addSectionC(infringementNoticeData);
        sectionDData = addSectionD(infringementNoticeData);
        sectionEData = addSectionE(infringementNoticeData);
        sectionFData = addSectionF(infringementNoticeData);
        // sectionGData = addSectionG(infringementNoticeData);
        // sectionHData = addSectionH(infringementNoticeData);

        if (sectionAData != '' || sectionBData != '' || sectionCData != '' || sectionDData != '' || sectionEData != '' || sectionFData != '' || sectionGData != '' || sectionHData != '') {

            db.collection('vehicleInformation').where('vehicleRegistrationNumber', '==', sectionBData.carRegNo).get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            const vehicleData = ({
                                id: doc.id,
                                data: doc.data()
                            });
                            if (vehicleData == '') {
                                response.status(400).send({ message: 'Vehicle was not found with the supplied vehicle registration number. Please ensure that the correct registration number is entered.' });
                                return false
                            }
                            db.collection('writtenInfringementNotices').add({})
                                .then(ref => {
                                    db.collection('users').doc('roadUsers').collection('individuals').doc(sectionAData.idNumber).get()
                                        .then(userData => {
                                            if (userData != '') {

                                                var userMerits = userData.data().meritPoints;
                                                var demeritPoints = userMerits - sectionBData.totalDemerits;

                                                db.collection('users').doc('roadUsers').collection('individuals').doc(sectionAData.idNumber).update({
                                                    meritPoints: demeritPoints
                                                });

                                                db.collection('writtenInfringementNotices').doc(ref.id).update({
                                                    idNumber: userData.id,
                                                    licenseNumber: userData.data().licenseNumber,
                                                    uid: userData.data().uid,
                                                    firstNames: userData.data().firstNames,
                                                    surname: userData.data().surname
                                                });

                                                db.collection('writtenInfringementNotices').doc(ref.id).update(infringementNoticeData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionA').set(sectionAData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionB').set(sectionBData);

                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionC').set(sectionCData);

                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionD').set(sectionDData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionE').set(sectionEData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionF').set(sectionFData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionG').set(sectionGData);
                                                // db.collection('writtenInfringementNotices').doc(ref.id).collection('writtenInfringementNoticeDetails').doc('sectionH').set(sectionHData);

                                                const mailOptions = {
                                                    from: 'The O Traffic Info <theotraffic.info@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
                                                    to: userData.data().emailAddress,
                                                    subject: 'Written Infringement Notie: ' + ref.id, // email subject
                                                    html: `<body aria-readonly="false"><font face="arial, helvetica, sans-serif">Dear ${userData.data().firstNames} ${userData.data().surname},<br />
                                                        <br />
                                                        You have received a infringement for leaving your vehicle unattended and have violated traffic law.<br />
                                                        <br />
                                                        Please note the following reference number: <strong>${ref.id}</strong></font><br />
                                                        <br />
                                                        <br />
                                                        Your demerit points have now decreased to <strong>${userData.data().meritPoints}</strong></font><br />
                                                        <br />
                                                        <span style="font-family:arial,helvetica,sans-serif">You are required to go to <strong>${infringementNoticeData.sectionE.policeStation}</strong> if you have any queries regarding your traffic offense.<br />
                                                        <br />
                                                        --<br />
                                                        Yours in safety,<br />
                                                        The-O Traffic</span></body>` // email content in HTML
                                                };

                                                transport.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        console.log(error);
                                                        return response.status(400).json({
                                                            message: 'An issue was detected while processing your request. Please contact support.'
                                                        });
                                                    }
                                                    else {
                                                        response.send({ message: 'Infringement successfully created and email sent to the owner of the vehicle.' })
                                                        return true;
                                                    }
                                                })
                                            }
                                            else {
                                                return response.status(202).send({ message: 'Road user with the entered ID number was not found. Please retry.' })
                                            }
                                        })
                                })
                                .catch(error => {
                                    console.log(error);
                                    return response.status(500).send(error);
                                });
                        })
                    }
                    else {
                        return response.status(400).send({ message: 'There was an issue processing your request. Please contact IT support.' })
                    }
                })
                .catch(error => {
                    console.log(error);
                    return response.status(400).send(error);
                })
        }
        else {
            response.status(400).send({ message: 'There is data missing in one of the sections. Please ensure that all information required is captured.' })
        }
    })
});

exports.getListOfWrittenInfringementsVehicleByRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserUID = request.query.roadUserUID;

        db.collectionGroup('writtenInfringementNotices').where('uid', '==', roadUserUID).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const roadUserInfringements = {
                            id: doc.id,
                            data: doc.data()
                        }

                        response.status(200).send(roadUserInfringements);
                    });
                }
                else {
                    return response.status(202).send({ message: 'Infringements not found.' })
                }
            })
            .catch(error => {
                console.log(error)
                return response.status(400).send({ message: 'There was an issue processing you request. Please contact IT support.' })
            });
    });
});

exports.getListOfInfringementsForUnattendedVehicleByRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserUID = request.query.roadUserUID;

        db.collection("infringementNoticeWithoutDriver").where('userUID', '==', roadUserUID).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const roadUserInfringements = {
                            id: doc.id,
                            data: doc.data()
                        }

                        return response.status(200).send(roadUserInfringements);
                    });
                }
                else {
                    return response.status(202).send({ message: 'Infringements not found.' })
                }
            })
            .catch(error => {
                console.log(error);
                return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
            });
    });
});

exports.getListOfWrittenInfringementsForRoadUser = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        const roadUserUID = request.query.roadUserUID;

        db.collection('writtenInfringementNotices').where('uid', '==', roadUserUID).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const roadUserInfringements = {
                            id: doc.id,
                            data: doc.data()
                        }

                        return response.status(200).send(roadUserInfringements);
                    });
                }
                else {
                    return response.status(202).send({ message: 'Infringements not found.' })
                }
            })
            .catch(error => {
                console.log(error);
                return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
            });
    });
});

exports.getStats = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== "GET") {
            return response.status(500).json({
                message: "Operation not allowed"
            });
        }

        db.collection('writtenInfringementNotices').get()
        .then (writtenInfringmentSnapshot => {
            var writtenInfringementsSize = writtenInfringmentSnapshot.size;

            db.collection('users').doc('roadUsers').collection('individuals').get()
            .then (roadUserSnapshot => {
                var roadUserSize = roadUserSnapshot.size;

                db.collection('users').doc('official').collection('metroPolice').get()
                .then (policeUserSnapshot => {
                    var policeOfficerSize = policeUserSnapshot.size;

                    db.collection('accidentReports').get()
                    .then(accidentSnapshot => {
                        var accidentsSnapshotSize = accidentSnapshot.size;

                        db.collection('infringementNoticeWithoutDriver').get()
                        .then(infringementNoticeWithoutDriveSnapshot => {
                            var infringementWithoutDriverSize = infringementNoticeWithoutDriveSnapshot.size;

                            db.collection('vehicleInformation').get()
                            .then(vehicleSnapshot => {
                                var vehicleDetailsSize = vehicleSnapshot.size;

                                response.status(200).send({
                                    writtenInfringementCount: writtenInfringementsSize,
                                    roadUserCount: roadUserSize,
                                    policeOfficerCount: policeOfficerSize,
                                    accidentsCount: accidentsSnapshotSize,
                                    infringementWithoutDriverCount: infringementWithoutDriverSize,
                                    vehiclesCount: vehicleDetailsSize
                                });

                            })
                            .catch(error => {
                                console.log(error);
                                return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
                    });
                })
                .catch(error => {
                    console.log(error);
                    return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
                });
            })
            .catch(error => {
                console.log(error);
                return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
            });
        })
        .catch(error => {
            console.log(error);
            return response.status(400).send({ message: 'Something went wrong with your request. Please contact IT support.' });
        });
    });
});