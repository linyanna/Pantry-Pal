# Pantry-pal
## Run Server
1. Make a new folder and name it `pantry-pal`.
2. Git clone this repository inside the newly made `pantry-pal` folder:
    ```
    cd /USER/PATH/TO/PANTRY-PAL
    git clone https://github.com/linyanna/pantry-pal.git
    ```
3. Install `npm` with `http-server` dependency ([see more](https://www.npmjs.com/package/http-server)):
    ```
    npm install http-server
    ```
4. Run `http-server` in root directory of project by typing the following in terminal:
    ```
    http-server
    ```
5. Open web browser and type `localhost:8080`.

## Camera Setup
1. Navigate to Arduino IDE application locally.
2. Select `File > Open > PATH_TO_LOCAL_PROJECT > resources > CameraWebServer > CameraWebServer.ino`.
3. Create new `WifiCredentials.h` file.
4. Fill in user wifi credentials based on `WifiCredentials_sample.h`.


## TODO List:

- [x] test [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API)
- [ ] test Javascript on esp32 with [Espruino interpreter](https://www.espruino.com/ESP32#:~:text=The%20ESP32%20is%20a%20dual,the%20ESP32%2C%20and%20other%20microcontrollers.)
- [x] test esp32 camera module
- [x] setup server
- [ ] send image to server from esp32
- [ ] retrieve image from server and process for detection API
- [ ] use barcode number to request UPC from [Open Foods API](https://world.openfoodfacts.org/data#:~:text=Live%20JSON%20and%20XML%20API)
- [ ] code add/remove item functionality
- [ ] refactor/organize code
- [ ] create physical UI (ie. LCD screen, buttons, etc.) to trigger code functionality
