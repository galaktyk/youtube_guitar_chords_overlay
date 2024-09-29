const TAG = "ChordsPlayer: ";







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

  async onCreateButton()
  {
    console.log(TAG + 'onCreateButton')




      let useDup = false
      let newName;

      if (globalSongData.chordVersionList.length > 0) {

        const clickedButton = await uiManager.showConfirm("Create new version by duplicate current chords?",
           ["Duplicate", "Create empty", "Cancel"]);
        if (clickedButton==="Duplicate") {
          useDup = true;
        }
        else if (clickedButton==="Create empty") {
          useDup = false
        }
        else {
          return;
        }
        newName = await uiManager.showPrompt("Enter your new version name");
        
      }
      else{
        newName = await uiManager.showPrompt("Enter your new version name");

      }


      if (!newName) return;

      let newChordsVersion;

      if (useDup) {
        newChordsVersion = deepCopyArray(globalSongData.chordVersionList[selectingChordVersion]);
      }else{
        newChordsVersion = new ChordData(); 
      }
      newChordsVersion.versionName = newName;
      newChordsVersion.uuid = generateRandomUUID(6);
      newChordsVersion.isLocal = true;
      const newSize = globalSongData.chordVersionList.push(newChordsVersion)
      selectingChordVersion = newSize-1;

      uiManager.reRenderVersionSelector();
      uiManager.reRenderChords();

      uiManager.setSelectVersion(selectingChordVersion);
      console.log("update index to " + selectingChordVersion)



    }





  async onUploadButton(){


    // First one who upload will set the song name
    if (globalSongData.songName === "") {

      globalSongData.songName =  document.title.replace(/^\(\d+\) | - YouTube$/g, '').trim();
      uiManager.updateSongData(this.lastVideoId);

    }

    const chordsData = globalSongData.chordVersionList[selectingChordVersion];





    if (!chordsData.isLocal){
      const password = await uiManager.showPrompt("Modify this version data on cloud, please enter your password"); 
      if (!password) return;
    
        console.log(TAG + "perform upload")
        
        const ret = await databaseManager.uploadData(this.lastVideoId, globalSongData.songName, chordsData,password)
      
      return;
    }

  
    const password = await uiManager.showPrompt("This version does not exist in cloud database yet, please enter your password for later modification/deletion"); 
    if (!password) return;


    chordsData.passwordHash = await sha256(password);

    console.log(TAG + "perform upload")

    uiManager.showOverlay();
    const ret = await databaseManager.uploadData(this.lastVideoId, globalSongData.songName, chordsData,password);
    console.log(ret)

    if(!ret){
      await uiManager.showAlert("No response from server");
      return
    }

    

    switch (ret.status) {
      case 200:
        chordsData.isLocal = false;
        await uiManager.showAlert("Upload success");
        
        break;
      case 401:
        await  uiManager.showAlert("Wrong password");
        break;
      default:
        await uiManager.showAlert("Upload failed, status code: " + ret.status);
        break;
    }

    uiManager.hideOverlay();




  }

  deleteLocal(){
    console.log(TAG + "perform local delete")
    globalSongData.chordVersionList.splice(selectingChordVersion, 1);

    uiManager.reRenderVersionSelector();

    // force select first available version, use chordsData.Uuid for checking
    selectingChordVersion = 0;
    uiManager.setSelectVersion(selectingChordVersion);
    uiManager.reRenderChords();
    console.log(TAG + "remove success")

    if (globalSongData.chordVersionList.length == 0) {
      globalSongData = new SongData();
      uiManager.updateSongData(this.lastVideoId);
    }

    return;


  }


  async onDeleteButton(){

    console.log(TAG + "perform delete")
    console.log(globalSongData.chordVersionList[selectingChordVersion])
    const chordsData = globalSongData.chordVersionList[selectingChordVersion];

    if (chordsData.isLocal){

      const clickedButton = await uiManager.showConfirm("Delete this version from your local?",
        ["Delete", "Cancel"]);

      if (clickedButton==="Delete") {
        this.deleteLocal();
        return; 
      }
      else {
        return;
      }
   
    }

    const password = await uiManager.showPrompt("Remove this veersion from cloud database, please enter password for deletion"); 
    if (!password) return;
    // TODO: Send to firebase function

    uiManager.showOverlay();

    const ret = await databaseManager.deleteSong(this.lastVideoId, chordsData.uuid, password);

    if (!ret){

      await uiManager.showAlert("No response from server");
      return;
    }

    switch (ret.status) {
      case 200:
        this.deleteLocal();
        await uiManager.showAlert("Delete success");
        
        break;
      case 401:
       await uiManager.showAlert("Wrong password");
        break;
      case 404:
        await uiManager.showAlert("This chords version does not exist in cloud database");
        break;
      default:
        await uiManager.showAlert("Unknown error, status code: " + ret.status);
        break;
    }


    uiManager.hideOverlay();



  }

  async onRenameButton(){
    const newName = await uiManager.showPrompt("Enter new name");
    if (!newName) return;

    globalSongData.chordVersionList[selectingChordVersion].versionName = newName;
    uiManager.reRenderVersionSelector();
    uiManager.setSelectVersion(selectingChordVersion);

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

  
    console.log(TAG+"fetchSongFromDatabase: "+videoId)
    globalSongData = await databaseManager.fetchSongFromDatabase(videoId);


    console.log(globalSongData)
    console.log("title: "+document.title)

    
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





document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'ArrowRight') {
      uiManager.changeCapoByShortcut(1);
  } else if (event.ctrlKey && event.key === 'ArrowLeft') {
    uiManager.changeCapoByShortcut(-1);
  }
});