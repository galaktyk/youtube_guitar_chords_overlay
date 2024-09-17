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
  lastVideoId;

  
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





    if (checkHostType()==HostType.UNDEFINED) return;
    

    // Track when change video.
    window.navigation.addEventListener("navigate", (event) => {
      const targetUrl = new URL(event.destination.url)
      console.log(TAG+ "navigate: " + targetUrl)
      this.onOpenNewTab(targetUrl);
    }
    );

     // Track when reload page.
    window.addEventListener('load', this.onOpenNewTab.bind(this, null));


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

      const newName = uiManager.createPopup("Enter version name");
   

      if (!newName) return;

      console.log("duplicate data"+selectingChordVersion )
      const dupData = deepCopyArray(globalSongData.chordVersionList[selectingChordVersion]);
      dupData.versionName = newName;
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




  onOpenNewTab(destinationUrl){
    if (!uiManager || !uiManager.checkPipReady()) return


    let newUrl;
    if (destinationUrl) {
      newUrl = destinationUrl;
      
    }else{
      newUrl = new URL(window.location.href);
    }

    console.log(TAG + 'onOpenNewTab: '+newUrl)

    const videoId = newUrl.searchParams.get('v');

    if(!videoId){
      console.log(TAG+"no videoId")
      uiManager.removeGuitarButton();

      return
    }
    this.onOpenNewSong(videoId);
    return;
  }


  async onOpenNewSong(videoId)
  {

    if (!uiManager || !uiManager.checkPipReady()) return
    console.log(TAG + 'onOpenNewSong: '+videoId)

    if (!videoId) {
      const currentUrl = new URL(window.location.href);
      videoId = currentUrl.searchParams.get('v');
    }

    if (!videoId) {
      console.log(TAG+"no videoId")
      return
    }
     

    if (videoId === this.lastVideoId) 
      {
        console.log("same videoId")
        return;
      }
    this.lastVideoId = videoId;


    selectingChordVersion = 0;

  

    globalSongData = await databaseManager.fetchSongFromDatabase(videoId);


    console.log(globalSongData)

    
    uiManager.updateSongData(videoId);
    uiManager.requestScroll(0);
    hooker.startHooking();

      return;

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




// function destroyAllUi() {
//   console.log(TAG+"destroyAllUi")
//   try{
//     beatRunner.destroy();
//     uiManager.destroy();
//   }catch(e){
//     console.log(e)
//   }

//   beatRunner = null
//   uiManager = null
//   lastDrawBox = null
//   currentBox= null
//   chordPlayer = null
//   databaseManager = null
//   hooker = null

// }


function start() {
  chordPlayer = new ChordsPlayer();
  chordPlayer.init();
  

  uiManager = new UiManager();
  uiManager.injectGuitarButton();


  beatRunner = new BeatRunner();  

  databaseManager = new DatabaseManager(
    "https://firestore.googleapis.com/v1/projects/guitar-chords-873b9/databases/(default)/documents/guitar-chords/"
  );

 

  hooker = new Hooker();


  chordPlayer.onOpenNewTab(null);

}



function disableFunctionality() {
  destroyAllUi()
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_URL') {
    const tabUrl = message.url;

    console.log(TAG + "open new tab")

    chordPlayer.onOpenNewTab(tabUrl);
    
    // Do something with the URL, e.g., update the content or perform some action
  }
});


start();