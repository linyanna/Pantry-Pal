var IotApi = require('@arduino/arduino-iot-client');
var rp = require('request-promise');


const CLIENT_ID: string = '';
const CLIENT_SECRET: string = '';
const THING_ID: string = "3887d238-1eb3-4f6a-b07e-4b5b3916ce59";
const VARIABLE_NAME: string = "distance";

IotApi.ApiClient.instance.authentications['oauth2'].accessToken

async function getToken() {
    var options = {
        method: 'POST',
        url: 'https://api2.arduino.cc/iot/v1/clients/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        json: true,
        form: {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: 'https://api2.arduino.cc/iot'
        }
    };

    try {
        const response = await rp(options);
        return response['access_token'];
    }
    catch (error) {
        console.error("Failed getting an access token: " + error)
    }
}

async function getData(): Promise<boolean> {
    let isOpen: boolean = false;
    var client: any = IotApi.ApiClient.instance;
    // Configure OAuth2 access token for authorization: oauth2
    var oauth2: any  = client.authentications['oauth2'];
    oauth2.accessToken = await getToken();

    var api: any  = new IotApi.DevicesV2Api(client)
    api.devicesV2List().then((devices: { thing: { properties: { last_value: any; }[]; }; }[]) => {
        let lastValue = devices[0].thing.properties[0].last_value;
        if (lastValue > 3) {
            isOpen = true;
        }
        console.log(isOpen);
    }, (error: any) => {
        console.log(error)
    });

    return isOpen;
}