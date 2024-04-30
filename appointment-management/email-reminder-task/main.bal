import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/time;

import wso2/choreo.sendemail as ChoreoEmail;

configurable string appointmentApiUrl = ?;

type Appointment record {
    string appointmentDate;
    string email;
    int id;
    string name;
    string phoneNumber;
    string 'service;
};

public function main() returns error? {
    io:println("Appintment URL: " + appointmentApiUrl);
    http:Client appointmentsApiEndpoint = check new (appointmentApiUrl);

    Appointment[] appointments = check appointmentsApiEndpoint->/appointments(upcoming = "true");

    foreach Appointment appointment in appointments {
        check sendEmail(appointment);
    }
}

function sendEmail(Appointment appointment) returns error? {

    string formattedAppointmentDate = check getIstTimeString(appointment.appointmentDate);

    string serviceName = convertAndCapitalize(appointment.'service);

    string finalContent = string `
Dear ${appointment.name},

This is a reminder for ${serviceName} at ${formattedAppointmentDate}.

Thank you for choosing HairCare.

Regards,
The HairCare Team

---

HairCare - The Best Cuts in Town
`;

    ChoreoEmail:Client emailClient = check new ();
    string sendEmailResponse = check emailClient->sendEmail(appointment.email, "Upcoming Appointment Reminder", finalContent);
    log:printInfo("Email sent successfully to: " + appointment.email + " with response: " + sendEmailResponse);
}

function getIstTimeString(string utcTimeString) returns string|error {
    time:Utc utcTime = check time:utcFromString(utcTimeString);

    time:TimeZone zone = check new ("Asia/Colombo");
    time:Civil istTime = zone.utcToCivil(utcTime);

    string emailFormattedString = check time:civilToEmailString(istTime, time:PREFER_TIME_ABBREV);
    return emailFormattedString;
}

function convertAndCapitalize(string input) returns string {
    string:RegExp r = re `-`;
    string[] parts = r.split(input);

    string result = "";
    foreach var word in parts {
        string capitalizedWord = word.substring(0, 1).toUpperAscii() + word.substring(1).toLowerAscii();
        if (result.length() > 0) {
            result = result + " " + capitalizedWord;
        } else {
            result = capitalizedWord;
        }
    }

    return result;
}
