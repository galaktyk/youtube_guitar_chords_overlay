const TAG = "ChordsPlayer: ";







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

    globalSongData = await databaseManager.fetchSongFromDatabase(videoId);


    console.log(globalSongData)

    
    uiManager.updateSongData(globalSongData, videoId);
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