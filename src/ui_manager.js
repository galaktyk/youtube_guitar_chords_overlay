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
<p>BPM: <span id="main-bpm"></span></p>
<p>capo: <span id="capo"></span></p>


Select chords version: <select id="version-selector"></select>

<label>
    <input type="checkbox" id="show-chord-image-checkbox" checked> Show chord image
</label>


<div id="chords-scroll-wrapper" style='display:flex; overflow:auto; height:70%'>
<div id="chords-scroll-container">
</div>
</div>





  `;
}



function makeDraggable(element) {

  // Local variables, let garbage collector handle it
  let isDragging = false;
  let startX, startY;
  let offsetX, offsetY;

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

    function onMouseMove(e) {
        if (isDragging) {
        // Calculate the new position of the element
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;

        // Set the new position
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
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
  /** @type {HTMLDivElement} */ #capoDiv;
 
  /** @type {HTMLDivElement} */ showChordImageDiv;




  // For ui only

  /// @type {SongData|null}

  showChordImage = true;


  constructor() {

    this.#floatingDiv = document.createElement('div');
    this.#floatingDiv.id = 'floating-div';
    this.#floatingDiv.style.position = 'fixed'; 
    this.#floatingDiv.style.bottom = '20%'; 
    this.#floatingDiv.style.left = '10%';
    this.#floatingDiv.style.width = '800px';
    this.#floatingDiv.style.height = '200px';
    this.#floatingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; 
    this.#floatingDiv.style.border = '2px solid';
    this.#floatingDiv.style.borderColor = almostRed; 
    this.#floatingDiv.style.zIndex = '9999'; 
    this.#floatingDiv.style.resize = 'both';
    this.#floatingDiv.style.overflow = 'auto'; 
    this.#floatingDiv.innerHTML = getUiHtml();


    this.#videoIdDiv = this.#floatingDiv.querySelector("#video-id");
    this.#songNameDiv = this.#floatingDiv.querySelector("#song-name");

    this.#mainBpmDiv = this.#floatingDiv.querySelector("#main-bpm");
    this.#capoDiv = this.#floatingDiv.querySelector("#capo");    
    this.versionSelector = this.#floatingDiv.querySelector("#version-selector");  
    this.#scrollContainerDiv = this.#floatingDiv.querySelector("#chords-scroll-container")


    this.showChordImageDiv = this.#floatingDiv.querySelector("#show-chord-image-checkbox");

    this.showChordImageDiv.addEventListener('change', () => {
      this.showChordImage = this.showChordImageDiv.checked;
      this.reRenderChords();
    });

    this.#floatingDiv.querySelector("#close-button").addEventListener('click',  ()=> {
      //const event = new CustomEvent("onCloseButton", {detail: {}});
      //this.dispatchEvent(event)
      console.log(TAG+"wanna close")
      chordPlayer.onCloseButton();

      
    });

    

  }



  async injectUi() {

    this.versionSelector.addEventListener('change', ()=> {
      selectingChordVersion = this.versionSelector.selectedIndex;
      this.reRenderChords();
    });
  
    // Add drag-and-drop functionality
    makeDraggable(this.#floatingDiv);
  
    // Append the new div to the body
    document.body.appendChild(this.#floatingDiv);

    

    // When window is resized
    const resizeObserver = new ResizeObserver(entries => {
      if (!this.#scrollContainerDiv || !this.#scrollContainerDiv.children[0]) return;

      for (let entry of entries) {
          const { height } = entry.contentRect;

          if (height > this.#scrollContainerDiv.children[0].clientHeight*6) {
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

    const chordData = globalSongData.chordVersionList[this.versionSelector.selectedIndex]


    this.#scrollContainerDiv.innerHTML = ''

    if(!chordData) return

    this.#scrollContainerDiv.innerHTML = 
    chordData.chords
      .map((chord, index) => {
        if (chord === "") {
          return `<div class="chord-box" id="chord-box-${index}" beatNumber="${index}"></div>`;
        }
  

        const chordTextClass = this.showChordImage ? "chord-text" : "chord-text-centered";

        return `
        <div class="chord-box" id="chord-box-${index}" beatNumber="${index}">
          <div class="${chordTextClass}">${chord}</div>
          ${!this.showChordImage ? "" : `<img class="chord-icon" src="${chrome.runtime.getURL("chord_icons/" + chord.replace("#", "s") + ".svg")}" />`}
        </div>`;
    })
      .join('');
  

      // For seeking
      this.#scrollContainerDiv.addEventListener('click', function(event) {
      const chordBox = event.target.closest('.chord-box');
      if (chordBox) {
        const beatNumber = chordBox.getAttribute('beatNumber');
        beatRunner.handleChordClick(beatNumber);
      }
    });
  
  

    this.#mainBpmDiv.textContent = chordData.mainBpm;
    this.#capoDiv.textContent = chordData.capo;
  
    //apply style
    this.#scrollContainerDiv.style.display = "flex";
    this.#scrollContainerDiv.style.flexDirection = "row";
    this.#scrollContainerDiv.style.overflowX = "auto";
    this.#scrollContainerDiv.style.width = "100%";
  }
  

  updateSongData(songData, videoId){

    if (!songData) return;


    this.#videoIdDiv.textContent = videoId;
    this.#songNameDiv.textContent = songData.songName;


    globalSongData = songData;

    
    this.reRenderVersionSelector();
    this.reRenderChords();

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



}

