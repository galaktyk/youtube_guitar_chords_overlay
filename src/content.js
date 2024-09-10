
const PluginState = Object.freeze({
  INITIALIZING: Symbol('INITIALIZING'),
  HOOKING: Symbol('HOOKING'),
  OKAY: Symbol('OKAY'),
  UNDEFINED: Symbol('UNDEFINED')
});



const HostType = Object.freeze({
  YOUTUBE: Symbol('YOUTUBE'),
  YOUTUBE_MUSIC: Symbol('YOUTUBE_MUSIC'),
  UNDEFINED: Symbol('UNDEFINED')
});

const PlayerState = Object.freeze({
  PLAYING: Symbol('PLAYING'),
  PAUSED: Symbol('PAUSED'),
  UNDEFINED: Symbol('UNDEFINED')
});


let prevFetchedId = ""
let isPlayerHooked = false;
let hostType=HostType.UNDEFINED;
let refPlayerState = PlayerState.UNDEFINED;
let hookIntervalId = 0;
let autoRunIntervalId = 0;
let currentBeat = 0.0;
let lastDrawIdx=-1;
let songBpm=120;//default 

// Divs
let floatingDiv;
let hookStateDiv;
let playerStateDiv;
let scrollContainerDiv;
let versionSelector;
let pluginStateDiv;
let capoDiv;

let prevTime = 0.0;
let shouldRunBeat = false;

//
let audioPlayer;
let pluginState = PluginState.UNDEFINED;

let beatIntervalsMs=null;
let beatScheduler=null;

let correctBeatIntervalId=null;

let needUrgentScroll = false;


// from database
let capoList = [];
let chordsList = [];
let mainBpmList = [];
let startChordList = [];
let tempoChangeList = [];
let versionNameList = [];



async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}


function getFieldValue(field){

  if (field === undefined) return "";

  if (field.stringValue !== undefined) {
    return field.stringValue; 
  
  } 

  else if (field.integerValue !== undefined) {
    return field.integerValue;
  
  }
  
  else if (field.doubleValue !== undefined) {
    return field.doubleValue;
   
  } else {
    return 0;
  }


}


function hideUi(){
  if (!isUiReady)return;
  console.log("click")


  floatingDiv.style.visibility = "hidden";



}




async function getChordTable(videoId) {

  // 1. Fetch the dictionary from the first Pastebin link
  const dictUrl = 'https://firestore.googleapis.com/v1/projects/guitar-chords-873b9/databases/(default)/documents/guitar-chords/'+videoId

  const data = await fetchData(dictUrl);


  prevFetched = videoId;



  if (!floatingDiv)return;


  if (!data || data === undefined || data.fields === undefined){
    floatingDiv.innerHTML = `
    <p  style="color: white">Video ID: <span id="video-id">${videoId} <br>
    Song not found in the database</span></p>
  `;
    return;
  }

  songName = getFieldValue(data.fields.song_name);
  // Parse chords based on each versions
  rawChordsVersionsList =  data.fields.chords_versions.arrayValue.values;
  


  rawChordsVersionsList.forEach(versionMap => {
    const capo = getFieldValue(versionMap.mapValue.fields.capo);
    const chords = getFieldValue(versionMap.mapValue.fields.chords).split(',');
    const mainBpm = getFieldValue(versionMap.mapValue.fields.song_bpm);
    const startChord = getFieldValue(versionMap.mapValue.fields.start_chord) * 1000;
    const tempoChangeString = getFieldValue(versionMap.mapValue.fields.tempo_change);

    const tempoChange = JSON.parse(tempoChangeString).map(item => {
        if (item.trim() === "") {
            // Handle the empty string case, you might want to return null or skip it
            return null;
        }
        const [beatNumber, bpm] = item.split(',').map(Number);
        return { beatNumber, bpm };
    }).filter(item => item !== null);
    
    tempoChange.push({ beatNumber:0, bpm:mainBpm})
    tempoChange.sort((a, b) => a.beatNumber - b.beatNumber);




    const versionName = getFieldValue(versionMap.mapValue.fields.version_name);
   
   
    capoList.push(capo);
    chordsList.push(chords);
    mainBpmList.push(mainBpm);
    startChordList.push(startChord)
    tempoChangeList.push(tempoChange);
    versionNameList.push(versionName);


  });






  floatingDiv.innerHTML = `
   <style>
        p{
        color: #ffffff;
        }
    
        body{
        color: #ffffff}



.chord-box {
    display: flex; /* Use flexbox for .chord-box */
    width: 50px; /* Set the width */
    height: 50px; /* Set the height */
    border: 1px solid #ffffff;
    border-radius: 13px;
    background: #1d1d1d;
    color: white;
    margin-right: 5px;
    align-items: center; /* Center text vertically */
    justify-content: center; /* Center text horizontally */
    font-size: 14px; /* Adjust font size as needed */
    box-sizing: border-box;
    min-width: 50px; /* Ensure minimum width even if empty */
}


    </style>


    <button id="close-button" style="position: absolute; right:0; top:0">X</button>

    <p>Plugin state: <span id="plugin-state">${pluginState.description}</span></p>
    <p>Video ID: <span id="video-id">${videoId}</span></p>
    <p>Song name: <span id="song-name">${songName}</span></p>
    <p>BPM: <span id="main-bpm"></span></p>
     <p>capo: <span id="capo"></span></p>


    

  <p>Hook state: <span id="hook-state">false</span><br></p>
    <p>Player state: <span id="player-state">-</span><br></p>

    
<select id="version-selector">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
    </select>


    <div id="chords-scroll-wrapper" style='display:flex; overflow:auto; height:70%'>
    <div id="chords-scroll-container">
    </div>
     </div>



  `;

  
  
  mainBpmDiv = document.getElementById("main-bpm");
  capoDiv = document.getElementById("capo");

  hookStateDiv = document.getElementById("hook-state");
  versionSelector = document.getElementById('version-selector');
  playerStateDiv = document.getElementById('player-state');
  scrollContainerDiv = document.getElementById("chords-scroll-container")
  pluginStateDiv = document.getElementById("plugin-state")

  const xButton = document.getElementById("close-button");
  xButton.addEventListener('click', () => {
    hideUi();
});


  // show the first version.  
  showChords();




  versionSelector.innerHTML = '';
    // Add new options
    versionNameList.forEach(versionName => {
      const newOptionElement = document.createElement('option');
      newOptionElement.value = versionName;  // Set value to the version name or an ID if you have one
      newOptionElement.textContent = versionName;  // Display the version name
      versionSelector.appendChild(newOptionElement);
  });





  versionSelector.addEventListener('change', function() {
      showChords();
      });



  return;
}

function showChords(){
  
  scrollContainerDiv.innerHTML = `
  ${ chordsList[versionSelector.selectedIndex].map(chord => `<div class="chord-box">${chord}</div>`).join('')}
  `

  mainBpmDiv.textContent = mainBpmList[versionSelector.selectedIndex];
  capoDiv.textContent = capoList[versionSelector.selectedIndex];

  //apply style
  scrollContainerDiv.style.display = "flex";
  scrollContainerDiv.style.flexDirection = "row";
  scrollContainerDiv.style.overflowX = "auto";
  scrollContainerDiv.style.width = "100%";
  scrollContainerDiv.style.flexWrap = "nowrap";
}



function isUiReady(){
  return floatingDiv && hookStateDiv  && playerStateDiv  && pluginStateDiv  && refPlayerState
}




function handlePlay(timestamp){
  if (refPlayerState==PlayerState.PLAYING)return;
  playerStateDiv.textContent = "playing > " + timestamp
  startAutoRunChords();
  refPlayerState = PlayerState.PLAYING;

}

function handlePause(timestamp){
  if (refPlayerState==PlayerState.PAUSED)return;

  playerStateDiv.textContent = "paused > "+timestamp;

  clearInterval(correctBeatIntervalId)
  stopAutoRunChords();
 

  refPlayerState = PlayerState.PAUSED;

}



function tryHookPlayer(){


  // don't hook if our ui isn't init yet

  if (!isUiReady())return;

  if (isPlayerHooked) return;


  pluginState = PluginState.HOOKING;
  pluginStateDiv.textContent = pluginState.description;



  switch(hostType){
    case HostType.YOUTUBE:
     audioPlayer = getYoutubePlayer();
     break;

    case HostType.YOUTUBE_MUSIC:
    audioPlayer = getYoutubeMusicPlayer();
    break;
  }


  if (!audioPlayer) return;

  hookPlayerEvents(audioPlayer, handlePlay, handlePause);
  
  isPlayerHooked = true;
  hookStateDiv.textContent = "true"
  
  
  clearInterval(hookIntervalId); 

  pluginState = PluginState.OKAY;
  pluginStateDiv.textContent = pluginState.description;



}

function injectCustomElement() {
  // Create a new div element for the floating box
  floatingDiv = document.createElement('div');
  
  // Set the ID and styles for the new div
  floatingDiv.id = 'custom-floating-box';
  floatingDiv.style.position = 'fixed'; // Use 'fixed' to position relative to the viewport
  floatingDiv.style.top = '20px'; // Initial top position
  floatingDiv.style.left = '20px'; // Initial left position
  floatingDiv.style.width = '500px';
  floatingDiv.style.height = '200px';
  floatingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Green with 40% transparency
  floatingDiv.style.border = '2px solid #000'; // Optional border for visibility
  floatingDiv.style.zIndex = '9999'; // Ensure it's on top of other elements
  floatingDiv.style.resize = 'both';
  floatingDiv.style.overflow = 'auto'; // Ensure content is scrollable if resized
  
  // Add initial content
  floatingDiv.innerHTML = `
  <p>Video ID: <span id="video-id">Loading...</span></p>
  `;

  // Add drag-and-drop functionality
  makeDraggable(floatingDiv);

  // Append the new div to the body
  document.body.appendChild(floatingDiv);



  // Update the video ID
  updateVideoIdAndChordTable();
}

// Function to make an element draggable
function makeDraggable(element) {
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


function checkHostType(){

  
  const url = new URL(window.location.href);

  if (url.href.includes("music.youtube")){
    
    hostType = HostType.YOUTUBE_MUSIC;
  }
  else if (url.href.includes("youtube")){
    hostType = HostType.YOUTUBE;
  }
  else{
    hostType = HostType.UNDEFINED;
    return;
  }
}


// Function to update the video ID in the floating box
async function updateVideoIdAndChordTable() {
  const url = new URL(window.location.href);
  const newVideoId = url.searchParams.get('v');

  if (newVideoId === prevFetchedId) return;

  isPlayerHooked = false;
  let videoId = newVideoId;
  prevFetchedId = newVideoId;



 await getChordTable(videoId);

}







async function highlightBeat(beatNumber){



  beatNumber = Math.floor(beatNumber);


  // Restore previous box color to normal
  if (lastDrawIdx >= 0){
    const lastDrawBox = scrollContainerDiv.children[lastDrawIdx];
    if (!lastDrawBox || !lastDrawBox.style) return;
    lastDrawBox.style = ""
  }


  // Change color of current beat's box
  const beatBox = scrollContainerDiv.children[beatNumber];
  if (!beatBox || !beatBox.style) return;

  beatBox.style.backgroundColor = "white"
  beatBox.style.color ="#1c1c1c";

  lastDrawIdx = beatNumber;



  if (needUrgentScroll || beatNumber % 4 ==0){
    beatBox.scrollIntoView({
      behavior: 'smooth',
      block: 'start', 
      inline: 'start'  
  });
    needUrgentScroll = false;

  }


  

}





function getCurrentBeat(currentTime){



  function getBeatDuration(bpm) {
    return 60000 / bpm;
  }


  let currentBPM = mainBpmList[versionSelector.selectedIndex];
  let totalTime = 0;
  let previousBeatNumber = 0;
  const startChordTimeMs = startChordList[versionSelector.selectedIndex];

  const tempoChange = tempoChangeList[versionSelector.selectedIndex];

  
  // Check if current time is before the first beat
  if (currentTime < startChordTimeMs) {
    const timeBeforeFirstBeat = startChordTimeMs - currentTime;
    return { beatNumber: -1, remainingTimeTillNextBeatMs: timeBeforeFirstBeat };
  }
  // Adjust current time to account for startChordTimeMs
  const adjustedCurrentTime = currentTime - startChordTimeMs;



  // Iterate through each tempo change event
  for (const change of tempoChange) {
      const { beatNumber, bpm: newBPM } = change;
      const beatDuration = getBeatDuration(currentBPM);
      const beatsPassed = beatNumber - previousBeatNumber;

      // Calculate total time for the beats up to the next tempo change
      const segmentTime = beatsPassed * beatDuration;

      // Check if the adjusted current time falls within this segment
      if (adjustedCurrentTime <= totalTime + segmentTime) {
          // Calculate the current beat within this segment
          const timeIntoSegment = adjustedCurrentTime - totalTime;
          const beatOffset = timeIntoSegment / beatDuration;
          const currentBeatNumber = previousBeatNumber + beatOffset;
          
          // Calculate remaining time till the next beat
          const nextBeatPosition = Math.ceil(beatOffset);
          const nextBeatTime = nextBeatPosition * beatDuration;
          const timeToNextBeat = nextBeatTime - timeIntoSegment;

          return { currentBeatNumber, remainingTimeTillNextBeatMs: timeToNextBeat };
      }

      // Update total time and BPM for the next segment
      totalTime += segmentTime;
      previousBeatNumber = beatNumber;
      currentBPM = newBPM;
  }

  // If the adjusted current time is beyond the last tempo change, handle it here
  const finalBeatDuration = getBeatDuration(currentBPM);
  const beatsPassed = (adjustedCurrentTime - totalTime) / finalBeatDuration;
  const finalBeatNumber = previousBeatNumber + beatsPassed;

  // Calculate remaining time till the next beat
  const timeIntoFinalSegment = (adjustedCurrentTime - totalTime) % finalBeatDuration;
  const timeToNextBeat = finalBeatDuration - timeIntoFinalSegment;

  return { currentBeatNumber: finalBeatNumber, remainingTimeTillNextBeatMs: timeToNextBeat };
}



function runBeat(){

  if (!shouldRunBeat)return;

  const beatResult = getCurrentBeat(audioPlayer.currentTime * 1000);
  const timeTillNextBeat = Math.max(0, beatResult.remainingTimeTillNextBeatMs);



  setTimeout(() => {
    highlightBeat(beatResult.currentBeatNumber +1)
    runBeat();
  }, timeTillNextBeat);


}



function startAutoRunChords(){
  shouldRunBeat = true;
  needUrgentScroll = true;
  runBeat()
 
  }



  



function stopAutoRunChords(){
  shouldRunBeat = false;
 

}



// =================================== START HERE ===========================================================================================


function enableFunctionality() {

    checkHostType();
    if (hostType==HostType.UNDEFINED)return;
    



    // Create floating div window
    injectCustomElement();



    // Listen for the web url
    window.addEventListener('popstate', updateVideoIdAndChordTable());
    window.addEventListener('hashchange', updateVideoIdAndChordTable()); 

    // Set up the MutationObserver
    const observer = new MutationObserver((mutations) => {
      // This code runs when DOM mutations are detected
      mutations.forEach((mutation) => {
          // You can check mutation targets here and decide if URL change might be involved
          // For example:
          if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
            updateVideoIdAndChordTable(floatingDiv)
          }


      });
    });

    // Configuration for the observer
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };

    // Start observing the document
    observer.observe(document, config);



    // Try hook player every 500ms

    hookIntervalId = setInterval(tryHookPlayer, 500);




    // Create a ResizeObserver instance
    const resizeObserver = new ResizeObserver(entries => {
      if (!scrollContainerDiv) return;

      for (let entry of entries) {
          const { height } = entry.contentRect;

          if (height > scrollContainerDiv.children[0].clientHeight*6) {
            scrollContainerDiv.style.flexWrap = "wrap";
          }else{
            scrollContainerDiv.style.flexWrap = "nowrap";
          }
      }
    });

    resizeObserver.observe(floatingDiv);



}

enableFunctionality();