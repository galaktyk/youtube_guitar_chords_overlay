const TAG = "ChordsPlayer: ";

function generateRandomUUID6() {
  // Generate a random number
  const randomNum = Math.floor(Math.random() * 0xFFFFFF);
  // Convert the number to a base-36 string (0-9a-z)
  const base36String = randomNum.toString(36);
  // Pad the string to ensure it has exactly 6 characters
  return base36String.padStart(6, '0');
}

function deepCopyArray(array) {
  return JSON.parse(JSON.stringify(array));
}



class ChordsPlayer{

  // Managers
  lastUrl;

  
  constructor(){
  
    console.log(TAG + "constructor()");

  }

  
  /**
   * Initialize the chords player for the given video ID.
   *
   * @param {string} videoId - The YouTube video ID.
   */
  init(){

    console.log(TAG + 'init')



    uiManager = new UiManager();
    beatRunner = new BeatRunner();  
    databaseManager = new DatabaseManager(
      "https://firestore.googleapis.com/v1/projects/guitar-chords-873b9/databases/(default)/documents/guitar-chords/"
    );

    hooker = new Hooker();

    if (checkHostType()==HostType.UNDEFINED) return;
    
    uiManager.injectUi();


    // Track when change video.
    window.navigation.addEventListener("navigate", (event) => {
      const targetUrl = new URL(event.destination.url)
      console.log(TAG+ "navigate: " + targetUrl)
      this.onOpenNewVideo(targetUrl);
    }
    );

     // Track when reload page.
    window.addEventListener('load', this.onOpenNewVideo.bind(this, null));


  }




  onCloseButton()
  {
    console.log(TAG + 'onCloseButton')
    disableFunctionality();
  }

  onCreateButton()
  {
    console.log(TAG + 'onCreateButton')


    if (globalSongData.chordVersionList.length > 0) {
      console.log("duplicate data"+selectingChordVersion )
      const dupData = deepCopyArray(globalSongData.chordVersionList[selectingChordVersion]);
      dupData.versionName = generateRandomUUID6();
      const newSize = globalSongData.chordVersionList.push(dupData)
      selectingChordVersion = newSize-1;

          
      uiManager.reRenderVersionSelector();
      //suiManager.reRenderChords();

      uiManager.setSelectVersion(selectingChordVersion);
      console.log("update index to " + selectingChordVersion)
    }
    else{
      console.log("no data to create")
    }


    
  }



  async onOpenNewVideo(destinationUrl)
  {
      if(!databaseManager) return;


    let newUrl;
    if (destinationUrl) {
      newUrl = destinationUrl;
      
    }else{
      newUrl = new URL(window.location.href);
    }

      
    if (newUrl == this.lastUrl) return;
    this.lastUrl = newUrl;



    const videoId = newUrl.searchParams.get('v');
    if (!videoId) return;

    console.log(TAG + 'onOpenNewVideo: '+videoId)

    selectingChordVersion = 0;

    globalSongData = await databaseManager.fetchSongFromDatabase(videoId);


    console.log(globalSongData)

    
    uiManager.updateSongData(videoId);
    beatRunner.init();



  }
  


}





// =================================== START HERE ===========================================================================================



// global this since use alot
let globalAudioPlayer;

/** @type {SongData} */
let globalSongData;

let selectingChordVersion = 0;

let chordPlayer
let beatRunner;
let uiManager;
let databaseManager;
let hooker

let lastDrawBox;
let currentBox;

function enableFunctionality() {

  console.log("enableFunctionality")


   chrome.runtime.sendMessage({ action: "getData" }, (response) => {
    console.log(response.data)
    const isCurrentlyEnable = response.data;
    if(isCurrentlyEnable){
      chordPlayer = new ChordsPlayer();
      chordPlayer.init();
    }

    });


}




function disableFunctionality() {

  hooker.unhookPlayer();

  beatRunner.stopAutoRunChords();
  beatRunner = null

  uiManager.removeFloatingDiv();
  uiManager = null
  lastDrawBox = null
  currentBox= null

  chordPlayer = null
  
  databaseManager = null
  hooker = null


  chrome.runtime.sendMessage({ action: "setData", newData: false }, (response) => {
    if (response.success) {
      console.log("Data successfully set in background.");
  } else {
      console.log("Failed to set data.");
  }
});




}


enableFunctionality();