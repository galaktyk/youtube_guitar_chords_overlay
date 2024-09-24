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
  border:1px dashed ${almostWhite};

  }

  input:disabled {
        border: 1px dashed transparent;
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
  z-index: 10;
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

  .checkboxes{
      display: flex;
    flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  border: 1px dashed ${almostWhite};
  }

textarea{
  
  width: -webkit-fill-available;
  height: 5rem; 
  resize: none;
  overflow: auto;
  
  }



</style>


    <div>Video ID: <span id="video-id"></span></div>
    <div>Song name: <input id="song-name" disabled style="width: 60%"></div>










<div style="display:flex; flex-direction: row">
  Select chords version: <select id="version-selector" style="width: fit-content;"></select>
  <button id="create-button" title="Create your new version" style="width: fit-content;">➕Create new</button>
</div>



  <div id="secret-button" style="visibility:hidden">
      <button id="rename-button" style="width: fit-content;">📝Rename</button>
      <button id="delete-button" style="width: fit-content;">🗑️Delete version</button>
      <button id="upload-button" title="Apply and upload this version to cloud database" style="width: fit-content;">💾Save to database</button>
  </div>


    <div>Current BPM: <span id="current-bpm"></span></div>
  
    <div>creator: <input id="creator-name" style="width: 200px" disabled></div>



<div style=" display: flex; flex-direction: row;">
Select capo fret: <select id="capo-selector" style="width: fit-content;">
  <option value="-2" >-2</option>
  <option value="-1">-1</option>
  <option value="0" selected>0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
</select>

  <div>(recommend capo: <input type="number" min="-2" max="24" id="recommend-capo" style="width: fit-content;" disabled>)</div>


  </div>







  <div class="checkboxes" style="   margin-right: 30px; padding: 5px;">
      <label>
          <input type="checkbox" id="edit-mode-checkbox"> Edit mode
      </label>

      <label>
          <input type="checkbox" id="show-chord-image-checkbox" checked> Show chord image
      </label>

      <label>
          <input type="checkbox" id="auto-scroll-checkbox" checked> Auto scroll
      </label>

            <label>
          <input type="checkbox" id="convert-sharp-checkbox"> Display flat as sharp
      </label>


  </div>



<div>

  <button id="hor-button" title="Horizontal mode" style="width: fit-content;">🔤</button>
  <button id="ver-button" title="Vertical mode" style="width: fit-content;">🔡</button>
</div>



<div id="chords-scroll-wrapper" style='overflow:auto; resize:horizontal'>
<div id="chords-scroll-container"></div>
</div>


<div id="secret-metadata" style="display:none">


  <label>
    Chord start: <input type="number" min="0" id="start-chord" style="width: 100px; background-color: white; color: black">
  </label>
  <br>

  <label>
      Tempo change list: <textarea  id="tempo-change-textbox"style="height: 2rem"></textarea>
  </label>

  <br>
  <label>
      Raw chords (in song's original key): <textarea  id="raw-chords-textbox" style="height: 5rem"></textarea>
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
   /** @type {HTMLDivElement} */ #currentBpmDiv;
  /** @type {HTMLDivElement} */ #recommendCapoDiv;
   /** @type {HTMLDivElement} */ #creatorNameDiv;
 
  /** @type {HTMLDivElement} */ showChordImageDiv;

  /** @type {HTMLDivElement} */ editModeDiv;



  /** @type {HTMLDivElement} */ tempoChangeDiv;
  /** @type {HTMLDivElement} */ rawChordsDiv;
  /** @type {HTMLDivElement} */ secretMetadataDiv;
  /** @type {HTMLDivElement} */ capoSelectorDiv;
  startChordDiv;
  secretButtonDiv;
  
  #hideWhenNoDataDiv;


  horButton;
  verButton;

  pipWindow = null;
  keyType = 'sharp';

  smallDiv;
  shouldAutoScroll = true;

  currentCapoValue = 0;


  useConvertSharp = false;



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

    this.#currentBpmDiv = this.#floatingDiv.querySelector("#current-bpm");
    this.#recommendCapoDiv = this.#floatingDiv.querySelector("#recommend-capo");    
    this.#creatorNameDiv = this.#floatingDiv.querySelector("#creator-name");
    this.versionSelector = this.#floatingDiv.querySelector("#version-selector");  
    this.#scrollContainerDiv = this.#floatingDiv.querySelector("#chords-scroll-container")


    this.showChordImageDiv = this.#floatingDiv.querySelector("#show-chord-image-checkbox");
    this.editModeDiv = this.#floatingDiv.querySelector("#edit-mode-checkbox");
    this.autoScrollDiv = this.#floatingDiv.querySelector("#auto-scroll-checkbox");
    this.convertSharpDiv = this.#floatingDiv.querySelector("#convert-sharp-checkbox");




    this.secretMetadataDiv = this.#floatingDiv.querySelector("#secret-metadata");
    this.secretButtonDiv = this.#floatingDiv.querySelector("#secret-button");
    
    this.startChordDiv = this.#floatingDiv.querySelector("#start-chord");
    this.tempoChangeDiv = this.#floatingDiv.querySelector("#tempo-change-textbox");
    this.rawChordsDiv = this.#floatingDiv.querySelector("#raw-chords-textbox");

    this.capoSelectorDiv = this.#floatingDiv.querySelector("#capo-selector");



    this.horButton = this.#floatingDiv.querySelector("#hor-button");

    
    this.#hideWhenNoDataDiv = this.#floatingDiv.querySelector("#hide-when-no-data");


    



    

    

  }



  bindingButtons() {
    


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

    this.#floatingDiv.querySelector("#upload-button").addEventListener('click',  ()=> {

      chordPlayer.onUploadButton();
    })

    this.#floatingDiv.querySelector("#delete-button").addEventListener('click',  ()=> {

      chordPlayer.onDeleteButton();
      
    })


    this.#floatingDiv.querySelector("#rename-button").addEventListener('click',  ()=> {

      chordPlayer.onRenameButton();


    })

    this.#floatingDiv.querySelector('#convert-sharp-checkbox').addEventListener('change',  ()=> {

      this.useConvertSharp = this.convertSharpDiv.checked;
      console.log("change useConvertSharp to " + this.useConvertSharp)
      if (this.useConvertSharp){
        this.keyType = "sharp";
      }else{
        this.keyType = detectKey(globalSongData.chordVersionList[selectingChordVersion].chords);
      }
      this.reRenderChords();
    })

    this.#floatingDiv.querySelector("#auto-scroll-checkbox").addEventListener('change',  ()=> {
      this.shouldAutoScroll = this.autoScrollDiv.checked;
    })


    this.versionSelector.addEventListener('change', ()=> {

      selectingChordVersion = this.versionSelector.selectedIndex;
      console.log("set selectingChordVersion to " + selectingChordVersion)
      this.reRenderChords();
    });

    this.#creatorNameDiv.addEventListener('input', (event)=> {

      globalSongData.chordVersionList[selectingChordVersion].creatorName = this.#creatorNameDiv.value;
    })


    this.capoSelectorDiv.addEventListener('change', ()=> {
      this.currentCapoValue = Number(this.capoSelectorDiv.value);
      console.log("set currentCapoValue to " + this.currentCapoValue)
      this.reRenderChords();

    })


    this.tempoChangeDiv.addEventListener('input', (event)=> {
      console.log("edit tempo")

      globalSongData.chordVersionList[selectingChordVersion].tempoChangeList = JSON.parse(this.tempoChangeDiv.value);
    })

    this.rawChordsDiv.addEventListener('input', (event)=> {
        console.log("edit rawChords")
        const newChords = this.rawChordsDiv.value.split(',');

        globalSongData.chordVersionList[selectingChordVersion].chords = newChords;
        this.reRenderChords();
    });

    this.#recommendCapoDiv.addEventListener('input', (event)=> {
      globalSongData.chordVersionList[selectingChordVersion].recommendCapo = this.#recommendCapoDiv.value;
    })

    this.startChordDiv.addEventListener('input', (event)=> {
      globalSongData.chordVersionList[selectingChordVersion].startChord = Number(this.startChordDiv.value);
    })




    
  }


  createPrompt(message) {
    return this.pipWindow.prompt(message);
  }

  createConfirm(message) {
    return this.pipWindow.confirm(message);
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
      this.bindingButtons();
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
    this.pipWindow.document.body.style.fontFamily = 'monospace';



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
      newOptionElement.textContent = `${chordData.versionName}`;
      this.versionSelector.appendChild(newOptionElement);
    
    });
  }





  /** @param {string[]} chordList */
  reRenderChords(){

    if (!globalSongData) return;

    

    const chordData = globalSongData.chordVersionList[selectingChordVersion]


    this.#scrollContainerDiv.innerHTML = ''

    if(!chordData) return


    // Transpose
    if (this.useConvertSharp){
      this.keyType = "sharp";
    }else{
      this.keyType = detectKey(globalSongData.chordVersionList[selectingChordVersion].chords);
    }

 
    


    this.#scrollContainerDiv.innerHTML = 
    chordData.chords
      .map((chordOri, index) => {
    


        const chord = handleTranspose(chordOri, -this.currentCapoValue, this.keyType);

       

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

  
  

    this.#recommendCapoDiv.value = chordData.recommendCapo;
    this.#creatorNameDiv.value = chordData.creatorName;

  
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

    this.startChordDiv.value = chordData.startChord;
    this.tempoChangeDiv.value = JSON.stringify(chordData.tempoChangeList);
    this.rawChordsDiv.value = chordData.chords.join(",")
  }


  handleChangeChordLabel(inputElement) {
  // Find the parent .chord-box element
  const chordBox = inputElement.closest('.chord-box');


  if (!chordBox) return;


  // Un-capo it.
  // also check input validation
  let rawLetter = handleTranspose(inputElement.value, this.currentCapoValue,this.keyType);


  // If invalid chord letters, just leave it as it is
  if (!rawLetter){
    rawLetter = inputElement.value;
   
  }

  

  // Get the beatNumber attribute from the .chord-box
  const beatNumber = chordBox.getAttribute('beatNumber');

  globalSongData.chordVersionList[this.versionSelector.selectedIndex].chords[beatNumber] = rawLetter;


  // update the lower UI
  this.updateSecretDiv();
  

}

clearUi(){

  this.#videoIdDiv.textContent = "";
  this.#songNameDiv.value = "";
  this.#recommendCapoDiv.value =  "";
  this.#currentBpmDiv.textContent =  "";
  this.#creatorNameDiv.value =  "";

  

}
  

  updateSongData(videoId){

    console.log(TAG+"updateSongData", videoId)

    this.clearUi();

    if (!globalSongData) return;



    console.log(TAG+"setup song data", globalSongData.songName)

    this.#videoIdDiv.textContent = videoId;
    this.#songNameDiv.value = globalSongData.songName;


   

    

    
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


    if (this.shouldAutoScroll){

    targetBox.scrollIntoView({
      behavior: 'smooth',
      block: 'start', 
      inline: 'start'  
    })
   
  }


  }


  onHighlightBeat(lastDrawBoxIdx,currentDrawBoxIdx,needUrgentScroll){
    
    if (lastDrawBoxIdx >= 0){
      lastDrawBox = this.#scrollContainerDiv.children[lastDrawBoxIdx];
    }

    let boxToFocusIdx;

    if (currentDrawBoxIdx >= 0){
      currentBox = this.#scrollContainerDiv.children[currentDrawBoxIdx];
      boxToFocusIdx = currentDrawBoxIdx;
    
    }
    // When seek to beginning and song chord is not start yet
    else{
      currentBox = null
      boxToFocusIdx = 0;
      
    }
    
    

    requestAnimationFrame(this.draw);
    


    


    if (needUrgentScroll || currentDrawBoxIdx % 4 == 0){
        this.requestScroll(boxToFocusIdx);
    };



    
    return;
    
  }


  turnOnEditMode(){
    this.#recommendCapoDiv.disabled = false;
    this.#creatorNameDiv.disabled = false;
    this.reRenderChords();
    this.secretButtonDiv.style.visibility = "visible";
    this.secretMetadataDiv.style.display = "block";

  }

  turnOffEditMode(){
    this.#recommendCapoDiv.disabled = true;
    this.#creatorNameDiv.disabled = true;
    this.reRenderChords();
    this.secretButtonDiv.style.visibility = "hidden";
    this.secretMetadataDiv.style.display = "none";

  }


  destroy(){
    this.clearUi();
    this.#floatingDiv = null;
  }


}

