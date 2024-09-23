




function deepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }
  

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function generateRandomUUID(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
  }
  




  async function uploadData(ytId, songName,chordsVersion,stringPassword){

    const firebaseFunctionUrl = "https://manage-song-272bip6eja-uc.a.run.app"

    const payloadChordsVersion = deepCopyArray(chordsVersion);



    // Convert list to string since firestore not support nested list
    payloadChordsVersion.tempoChangeList = JSON.stringify(payloadChordsVersion.tempoChangeList);
    payloadChordsVersion.chords = payloadChordsVersion.chords.join(",");


    const payload = {
        // for checking
        "ytId": ytId,
        "songName": songName,
        "password": stringPassword,

        // for store
        "chordsVersion": payloadChordsVersion
        
    }


    console.log(payload)


    const response = await fetch(firebaseFunctionUrl, {
        method: 'POST', 
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), 
    })
    console.log(response)
     

    
    return response;

  }