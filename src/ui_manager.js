const almostBlack = "#1d1d1d"
const almostWhite = "#e8e9ec"
const almostRed = "#C63C51"




function getUiHtml()
{



    return `
<style>
  p{
  color: #ffffff;
  }
  body{
      color: #ffffff
      
  }

  input{
  background: none;
  color:${almostWhite};
  border:1px solid white;
  }



  .chord-box {
  position:relative;

  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 75px; 
  height: 75px; 


  min-width: 75px;

  border-radius: 13px;
  background: ${almostWhite};
  color: ${almostBlack};
  margin-right: 5px;

  font-size: 18px;
  font-weight: bold;
  box-sizing: border-box;

  text-align: center;

  user-select: none; 
  -webkit-user-select: none; 
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: pointer; 
  margin:2px;
  }
  .chord-box:hover {
  cursor: pointer; 
  }

  .chord-text{
  position: absolute;
  top: 0;
  width: -webkit-fill-available;
  }

  .chord-text-input{
    color:${almostBlack};
  font-family: Roboto;
    font-size: 18px;
    font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center; 
  }

  .chord-text-centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
    .beat-number-preview {
  position: absolute;
  font-weight: 100;
  color: #6D972E;
  top: 4px;
  left: 4x;
  font-size: 9px;

}


  .chord-icon{
  border-radius: 13px;

  position: absolute;
  bottom: 4%;
  left: 10%;
  width: 80%;
  background:${almostWhite}
  }




</style>


<div id="top-wrapper" style="display:flex; flex-direction: row; justify-content: space-between; align-items: center">
  <div id="song-info" style="display:flex; flex-direction: column">
    <div>Video ID: <span id="video-id"></span></div>
    <div>Song name: <span id="song-name"></span></div>
    <div>Song BPM: <span id="main-bpm"></span></div>
    <div>Current BPM: <span id="current-bpm"></span></div>
    <div>capo: <input id="capo" style="width: 50px" disabled></div>
  </div> 

  <div id="player-div" style="display:flex; flex-direction: row">
      <button id="reverse-button" style="width: fit-content;">⏪</button>
      <button id="play-button" style="width: fit-content;">▶️</button>
      <button id="forward-button" style="width: fit-content;">⏩</button>

      


  </div>
</div>



<div style="display:flex; flex-direction: row">
Select chords version: <select id="version-selector" style="width: fit-content;"></select>
<button id="create-button" title="Create your new version" style="width: fit-content;">➕Create new</button>


</div>

<div id="secret-button" style="display:none">
    <button id="edit-version-name-button" style="width: fit-content;">📝Rename</button>
     <button id="bin-button" style="width: fit-content;">🗑️Delete version</button>
    <button id="upload-button" title="Upload this version to cloud database" style="width: fit-content;">⬆️Upload</button>
</div>


<label>
    <input type="checkbox" id="edit-mode-checkbox"> Edit mode
</label>

<label>
    <input type="checkbox" id="show-chord-image-checkbox" checked> Show chord image
</label>


<div>

  <button id="hor-button" title="Horizontal mode" style="width: fit-content;">🔤</button>
  <button id="ver-button" title="Vertical mode" style="width: fit-content;">🔡</button>
</div>



<div id="chords-scroll-wrapper" style='overflow:auto; resize:horizontal'>
<div id="chords-scroll-container"></div>
</div>


<div id="secret-metadata" style="display:none">
  <label>
      Tempo changes: <div contenteditable="true" id="tempo-change-textbox"></div>
  </label>

  <br>
  <label>
      Raw chords: <div contenteditable="true" id="raw-chords-textbox"></div>
  </label>

</div>





  `;
}




class UiManager{


  // Divs


  
  /** @type {HTMLDivElement} */ #floatingDiv;


  /** @type {HTMLDivElement} */ #songNameDiv;
  /** @type {HTMLDivElement} */ #videoIdDiv;

  /** @type {HTMLDivElement} */ #scrollContainerDiv;
  /** @type {HTMLDivElement} */ versionSelector;
  /** @type {HTMLDivElement} */ #mainBpmDiv;
   /** @type {HTMLDivElement} */ #currentBpmDiv;
  /** @type {HTMLDivElement} */ #capoDiv;
 
  /** @type {HTMLDivElement} */ showChordImageDiv;

  /** @type {HTMLDivElement} */ editModeDiv;



  /** @type {HTMLDivElement} */ tempoChangeDiv;
  /** @type {HTMLDivElement} */ rawChordsDiv;
  /** @type {HTMLDivElement} */ secretMetadataDiv;
  secretButtonDiv;


  horButton;
  verButton;

  pipWindow = null;


  smallDiv;




  // For ui only

  /// @type {SongData|null}

  showChordImage = true;
  isEditmode = false;


  constructor() {

    this.#floatingDiv = document.createElement('div');
    this.#floatingDiv.id = 'floating-div';
    this.#floatingDiv.style.width = '100%';
    this.#floatingDiv.style.height = '100%';
    this.#floatingDiv.style.flexDirection = 'column';
    this.#floatingDiv.style.display = "flex";
    this.#floatingDiv.style.backgroundColor = almostBlack; 
    this.#floatingDiv.style.overflow = 'auto'; 
    this.#floatingDiv.style.fontSize = '14px'


    this.#floatingDiv.innerHTML = getUiHtml();


    this.#videoIdDiv = this.#floatingDiv.querySelector("#video-id");
    this.#songNameDiv = this.#floatingDiv.querySelector("#song-name");

    this.#mainBpmDiv = this.#floatingDiv.querySelector("#main-bpm");
    this.#currentBpmDiv = this.#floatingDiv.querySelector("#current-bpm");
    this.#capoDiv = this.#floatingDiv.querySelector("#capo");    
    this.versionSelector = this.#floatingDiv.querySelector("#version-selector");  
    this.#scrollContainerDiv = this.#floatingDiv.querySelector("#chords-scroll-container")


    this.showChordImageDiv = this.#floatingDiv.querySelector("#show-chord-image-checkbox");
    this.editModeDiv = this.#floatingDiv.querySelector("#edit-mode-checkbox");


    this.secretMetadataDiv = this.#floatingDiv.querySelector("#secret-metadata");
    this.secretButtonDiv = this.#floatingDiv.querySelector("#secret-button");
    this.tempoChangeDiv = this.#floatingDiv.querySelector("#tempo-change-textbox");
    this.rawChordsDiv = this.#floatingDiv.querySelector("#raw-chords-textbox");



    this.horButton = this.#floatingDiv.querySelector("#hor-button");
    


    this.horButton.addEventListener('click', ()=> {
      this.#scrollContainerDiv.style.flexWrap = 'nowrap';
    });


    this.verButton = this.#floatingDiv.querySelector("#ver-button");

    this.verButton.addEventListener('click', ()=> {
      this.#scrollContainerDiv.style.flexWrap = 'wrap';
    });


    
    

    this.showChordImageDiv.addEventListener('change', () => {
      this.showChordImage = this.showChordImageDiv.checked;
      this.reRenderChords();
    });


    this.editModeDiv = this.#floatingDiv.querySelector("#edit-mode-checkbox");
    this.editModeDiv.addEventListener('change', () => {

      this.isEditmode = this.editModeDiv.checked;

      if (this.isEditmode){
        this.turnOnEditMode();
      }else{
        this.turnOffEditMode();
      }
      

    });

    this.#floatingDiv.querySelector("#create-button").addEventListener('click',  ()=> {

      chordPlayer.onCreateButton();

      
    });


    this.versionSelector.addEventListener('change', ()=> {

      selectingChordVersion = this.versionSelector.selectedIndex;
      console.log("set selectingChordVersion to " + selectingChordVersion)
      this.reRenderChords();
    });







    

    

  }


  createPopup(message) {
    return this.pipWindow.prompt(message);
  }





  async injectGuitarButton() {

    if (this.smallDiv) return;

   
    this.smallDiv = document.createElement('div');
    this.smallDiv.id = 'small-div';
    this.smallDiv.innerHTML = `
    <div style="position: absolute; top: 5rem; left: 61%;z-index: 999;">
      <button id="pip-button">🎸</button>

    </div>
    `

    document.body.append(this.smallDiv);

    this.smallDiv.querySelector("#pip-button").addEventListener('click', async ()=> {
      await this.showPip();
      chordPlayer.onOpenNewSong(null)
    });


  }

  removeGuitarButton(){
    if(!this.smallDiv) return;
    document.body.removeChild(this.smallDiv);
    this.smallDiv = null;
  }



  async showPip(){

    this.pipWindow = await documentPictureInPicture.requestWindow({disallowReturnToOpener: true, width: 750, height: 200});
    this.pipWindow.document.body.append(this.#floatingDiv);
    this.pipWindow.document.body.style.backgroundColor = almostBlack;



    this.pipWindow.addEventListener("pagehide", (event) => {

      console.log("pip hide")
      this.pipWindow = null;
      //destroyAllUi();
    });


  }


  checkPipReady(){
    const isPipReady = (this.pipWindow !== null) && (this.pipWindow !== undefined);
    console.log(TAG+"checkPipReady",isPipReady)
    return isPipReady
  }






  setSelectVersion(newVersionToSelect){
    this.versionSelector.selectedIndex = newVersionToSelect;
  }





  reRenderVersionSelector(){

    if (!globalSongData) return;

    
    this.versionSelector.innerHTML = '';

    globalSongData.chordVersionList.forEach(chordData => {
      const newOptionElement = document.createElement('option');
      newOptionElement.textContent = `${chordData.versionName} (by ${chordData.creatorName})`;
      this.versionSelector.appendChild(newOptionElement);
    
    });
  }



  /** @param {string[]} chordList */
  reRenderChords(){

    if (!globalSongData) return;

    

    const chordData = globalSongData.chordVersionList[selectingChordVersion]


    this.#scrollContainerDiv.innerHTML = ''

    if(!chordData) return

    this.#scrollContainerDiv.innerHTML = 
    chordData.chords
      .map((chord, index) => {

        if (this.isEditmode){


          return `
          <div class="chord-box" id="chord-box-${index}" beatNumber="${index}">
            <div class="beat-number-preview">${index}</div>
            <input class="chord-text-input" value="${chord}">
            </div>`;


        }
        else{
          let chordTextClass = this.showChordImage ? "chord-text" : "chord-text-centered";
          if (chord === "") {
            return `<div class="chord-box" id="chord-box-${index}" beatNumber="${index}"></div>`;
          }

          return `
          <div class="chord-box" id="chord-box-${index}" beatNumber="${index}">
            <div class="${chordTextClass}">${chord}</div>
            ${!this.showChordImage ? "" : `<img class="chord-icon" src="${chrome.runtime.getURL("chord_icons/" + chord.replaceAll("#", "s").replaceAll("/", "_") + ".svg")}" />`}
          </div>`;

        }


    })
      .join('');
  



      this.#scrollContainerDiv.addEventListener('click', function(event) {
        // Find the chordBox and the input element
        const chordBox = event.target.closest('.chord-box');
        if (!chordBox) return; // Exit if no chord box is found
        
        const textInput = chordBox.querySelector('.chord-text-input');
        const beatNumber = chordBox.getAttribute('beatNumber');
        
        // Check if textInput is null or if the click is outside of textInput
        if (!textInput || (event.target !== textInput && !textInput.contains(event.target))) {
          beatRunner.handleChordClick(beatNumber);
        }

      });



      if (this.isEditmode){
        this.#scrollContainerDiv.addEventListener('input', (event)=> {
          if (event.target.classList.contains('chord-text-input')) {
              this.handleChangeChordLabel(event.target);
          }
      });
      }
      

  
  

    this.#mainBpmDiv.textContent = chordData.mainBpm;
    this.#capoDiv.value = chordData.capo;

  
    //apply style
    this.#scrollContainerDiv.style.display = "flex";
    this.#scrollContainerDiv.style.flexDirection = "row";
    this.#scrollContainerDiv.style.overflowX = "auto";
    this.#scrollContainerDiv.style.width = "100%";

    this.updateSecretDiv();
  }

  updateSecretDiv(){
    const chordData = globalSongData.chordVersionList[this.versionSelector.selectedIndex]
    if (!chordData) return;

    this.tempoChangeDiv.innerHTML = JSON.stringify(chordData.tempoChangeList.map(obj => `${obj.beatNumber},${obj.bpm}`));
    this.rawChordsDiv.innerHTML = chordData.chords.join(",")
  }


  handleChangeChordLabel(inputElement) {
  // Find the parent .chord-box element
  const chordBox = inputElement.closest('.chord-box');
  
  if (chordBox) {
      // Get the beatNumber attribute from the .chord-box
      const beatNumber = chordBox.getAttribute('beatNumber');
      
      // Get the value from the input field
      const newChordLabel = inputElement.value;

      const currentCordVersion = globalSongData.chordVersionList[this.versionSelector.selectedIndex];
      currentCordVersion.chords[beatNumber] = newChordLabel;
      
      // Add any additional logic you need here
  }
}

clearUi(){

  this.#songNameDiv.textContent = "Not found";
  this.#videoIdDiv.textContent = "";
  this.#mainBpmDiv.textContent =  "";
  this.#capoDiv.value =  "";
  this.#currentBpmDiv.textContent =  "";
}
  

  updateSongData(videoId){

    console.log(TAG+"updateSongData", videoId)

    this.clearUi();

    if (!globalSongData) return;

    console.log(TAG+"setup song data", globalSongData.songName)

    this.#videoIdDiv.textContent = videoId;
    this.#songNameDiv.textContent = globalSongData.songName;
    

    
    this.reRenderVersionSelector();
    this.reRenderChords();
    this.updateSecretDiv();


  }


  updateCurrentBpm(bpm){
    this.#currentBpmDiv.textContent = bpm;
  }


  draw(t){
    // Restore previous box color to normal
   

    if (lastDrawBox){
      lastDrawBox.style.backgroundColor = almostWhite;
    }
      

    if (currentBox){
      currentBox.style.backgroundColor = almostRed;
    }

  }


  requestScroll(boxIndex){


    const targetBox = this.#scrollContainerDiv.children[boxIndex];
    if(!targetBox) return;

      targetBox.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
        inline: 'start'  
      })
   


  }


  onHighlightBeat(lastDrawBoxIdx,currentDrawBoxIdx,needUrgentScroll){
    


    if (lastDrawBoxIdx >= 0){
      lastDrawBox = this.#scrollContainerDiv.children[lastDrawBoxIdx];
    }


    currentBox = this.#scrollContainerDiv.children[currentDrawBoxIdx];

    if (!currentBox) return;

    requestAnimationFrame(this.draw);




    if (needUrgentScroll || currentDrawBoxIdx % 4 == 0){
        this.requestScroll(currentDrawBoxIdx);
    };



    
    return;
    
  }


  turnOnEditMode(){
    this.#capoDiv.disabled = false;
    this.reRenderChords();
    this.secretButtonDiv.style.display = "block";
    this.secretMetadataDiv.style.display = "block";

  }

  turnOffEditMode(){
    this.#capoDiv.disabled = true;
    this.reRenderChords();
    this.secretButtonDiv.style.display = "none";
    this.secretMetadataDiv.style.display = "none";

  }


  destroy(){
    this.clearUi();
    this.#floatingDiv = null;
  }


}

