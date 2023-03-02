var myCharacteristic;

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');
startBtn.addEventListener("click", onStartButtonClick)
stopBtn.addEventListener("click", onStopButtonClick)

function log(text) {
  document.querySelector("#log").value += text + "\n"
}

function bytes2int16(high, low) {
  return (low << 8) | high
}

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
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      optionalServices: [serviceUuid, characteristicUuid],
      acceptAllDevices: true
    });

    log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    log('Getting Characteristic...');
    myCharacteristic = await service.getCharacteristic(characteristicUuid);

    await myCharacteristic.startNotifications();

    log('> Notifications started');
    myCharacteristic.addEventListener('characteristicvaluechanged',
    handleNotifications);
    // let Ts = 
    // if(Ts != 0){
    //   let Timestamp = bytes2int16(Ts[0], Ts[1])
    //   let percentage = bytes2int16(Ts[2], Ts[3]) / 10
    //   let voltage = bytes2int16(Ts[4], Ts[5]) / 1000
    //   let current = bytes2int16(Ts[6], Ts[7]) / 10
    //   let status = parseInt(Ts[8])
    //   if (status == 2) { current = 0 }
    //   console.log(Timestamp, percentage, voltage, current, status)
    //   Ts = 0
    // }
  } catch (error) {
    log('Argh! ' + error);
  }
}


async function onStopButtonClick() {
  if (myCharacteristic) {
    try {
      await myCharacteristic.stopNotifications();
      log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
        handleNotifications);
    } catch (error) {
      log('Argh! ' + error);
    }
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  console.log(event);
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  // document.querySelector("#log").value += a.join(' ')
  return a
  log('> ' + a.join(' '));
}
