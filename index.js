var myCharacteristic;

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');
startBtn.addEventListener("click", onStartButtonClick)
stopBtn.addEventListener("click", onStopButtonClick)

async function onStartButtonClick() {
  let serviceUuid = document.querySelector('#service').value;
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = document.querySelector('#characteristic').value;
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  try {
    console.log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      optionalServices: [serviceUuid, characteristicUuid],
      acceptAllDevices: true
    });

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    console.log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    console.log('Getting Characteristic...');
    myCharacteristic = await service.getCharacteristic(characteristicUuid);

    await myCharacteristic.startNotifications();

    console.log('> Notifications started');
    myCharacteristic.addEventListener('characteristicvaluechanged',
      handleNotifications);
  } catch (error) {
    console.log('Argh! ' + error);
  }
}

async function onStopButtonClick() {
  if (myCharacteristic) {
    try {
      await myCharacteristic.stopNotifications();
      console.log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
        handleNotifications);
    } catch (error) {
      console.log('Argh! ' + error);
    }
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));
}
