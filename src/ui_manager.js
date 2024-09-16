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
  color:${almostWhite}
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


  .chord-icon{
  border-radius: 13px;

  position: absolute;
  bottom: 4%;
  left: 10%;
  width: 80%;
  background:${almostWhite}
  }




</style>

<button id="close-button" style="position: absolute; right:0; top:0">X</button>

<p>Video ID: <span id="video-id"</span></p>
<p>Song name: <span id="song-name"></span></p>
<p>Song BPM: <span id="main-bpm"></span></p>
<p>Current BPM: <span id="current-bpm"></span></p>
<p>capo: <input id="capo" style="width: 50px" disabled></p>


<div style="display:flex; flex-direction: row">
Select chords version: <select id="version-selector" style="width: fit-content;"></select>
 <input id="version-name-input" style="width:200px">

 <button id="cancel-create-button" style="width: fit-content;">❌</button>
 <button id="edit-version-name-button" style="width: fit-content;">📝Rename</button>
 <button id="bin-button" style="width: fit-content;">🗑️Delete version</button>
<button id="create-button" title="Create your new version" style="width: fit-content;">➕Create new</button>

<button id="upload-button" title="Upload this version to cloud database" style="width: fit-content;">⬆️Upload</button>
</div>


<label>
    <input type="checkbox" id="edit-mode-checkbox"> Edit mode
</label>

<label>
    <input type="checkbox" id="show-chord-image-checkbox" checked> Show chord image
</label>



<div id="chords-scroll-wrapper" style='flex:1; overflow:auto; height:70%'>
<div id="chords-scroll-container"></div>
</div>


<br>
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



function makeDraggable(element) {

  // Local variables, let garbage collector handle it
  let isDragging = false;
  let startX, startY;
  let offsetX, offsetY;
  let requestId;

  element.addEventListener('mousedown', (e) => {
      // Calculate initial mouse position and offsets relative to the element
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      offsetX = startX - rect.left;
      offsetY = startY - rect.top;

      if (offsetY > 50) return;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  });


// Function to handle the actual update of position
  function updatePosition(e) {
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    // Set the new position
    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;
  }

  // Mouse move handler
  function onMouseMove(e) {
    if (isDragging) {
        // Cancel the previous animation frame request if it exists
        if (requestId) {
            cancelAnimationFrame(requestId);
        }

        // Request a new animation frame
        requestId = requestAnimationFrame(() => updatePosition(e));
    }
  }


    function onMouseUp() {
        if (isDragging) {
        isDragging = false;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Start dragging only when mouse moves a significant distance
    element.addEventListener('mousemove', (e) => {
        const moveX = e.clientX - startX;
        const moveY = e.clientY - startY;
        if (!isDragging && (Math.abs(moveX) > 5 || Math.abs(moveY) > 5)) {
        isDragging = true;
        }
    });
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




  // For ui only

  /// @type {SongData|null}

  showChordImage = true;
  isEditmode = false;


  constructor() {

    this.#floatingDiv = document.createElement('div');
    makeDraggable(this.#floatingDiv);
    this.#floatingDiv.id = 'floating-div';
    this.#floatingDiv.style.position = 'fixed'; 
    this.#floatingDiv.style.flexDirection = 'column';
    this.#floatingDiv.style.display = "flex";
    this.#floatingDiv.style.bottom = '20%'; 
    this.#floatingDiv.style.left = '10%';
    this.#floatingDiv.style.width = '800px';
    this.#floatingDiv.style.height = '260px';
    this.#floatingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; 
    this.#floatingDiv.style.border = '2px solid';
    this.#floatingDiv.style.borderColor = almostRed; 
    this.#floatingDiv.style.zIndex = '9999'; 
    this.#floatingDiv.style.resize = 'both';
    this.#floatingDiv.style.overflow = 'auto'; 

    this.#floatingDiv.style.userSelect = 'none';



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
    this.tempoChangeDiv = this.#floatingDiv.querySelector("#tempo-change-textbox");
    this.rawChordsDiv = this.#floatingDiv.querySelector("#raw-chords-textbox");
    
    

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
    this.#floatingDiv.querySelector("#close-button").addEventListener('click',  ()=> {

      chordPlayer.onCloseButton();

      
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



  async injectUi() {


  
    // Add drag-and-drop functionality
    
  
    // Append the new div to the body
    document.body.appendChild(this.#floatingDiv);

    

    // When window is resized
    const resizeObserver = new ResizeObserver(entries => {
      if (!this.#scrollContainerDiv || !this.#scrollContainerDiv.children[0]) return;

      for (let entry of entries) {
          const { height } = entry.contentRect;

          if (height > this.#scrollContainerDiv.children[0].clientHeight*4) {
            this.#scrollContainerDiv.style.flexWrap = "wrap";
          }else{
            this.#scrollContainerDiv.style.flexWrap = "nowrap";
          }
      }
    });

    resizeObserver.observe(this.#floatingDiv);



  }

  removeFloatingDiv(){

    document.body.removeChild(this.#floatingDiv);
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
    console.log("set new capo to ", chordData.capo, "from version "+selectingChordVersion);
  
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

    this.clearUi();

    if (!globalSongData) return;


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


  onHighlightBeat(lastDrawBoxIdx,currentDrawBoxIdx,needUrgentScroll){
    


    if (lastDrawBoxIdx >= 0){
      lastDrawBox = this.#scrollContainerDiv.children[lastDrawBoxIdx];
    }
    currentBox = this.#scrollContainerDiv.children[currentDrawBoxIdx];

    if (!currentBox) return;

    requestAnimationFrame(this.draw);


    if (needUrgentScroll || currentDrawBoxIdx % 4 == 0){
      currentBox.scrollIntoView({
      behavior: 'smooth',
      block: 'start', 
      inline: 'start'  
    });


    }
    return;
    
  }


  turnOnEditMode(){
    this.#capoDiv.disabled = false;
    this.reRenderChords();
    this.secretMetadataDiv.style.display = "block";

  }

  turnOffEditMode(){
    this.#capoDiv.disabled = true;
    this.reRenderChords();
    this.secretMetadataDiv.style.display = "none";

  }


}

