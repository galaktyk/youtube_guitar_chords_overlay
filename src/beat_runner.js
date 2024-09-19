
const PlayerState = Object.freeze({
    UNDEFINED: Symbol('UNDEFINED'),
    PLAYING: Symbol('PLAYING'),
    PAUSED: Symbol('PAUSED'),
})



class BeatRunner
{


    refPlayerState = PlayerState.UNDEFINED;
    nextRunbeatEvent;

    shouldRunBeat = false;
    needUrgentScroll=false;

    lastDrawIdx = -1;

 


    constructor(){
      
    }

    init(){
        
    }


    handlePlay(timestamp){
        if (this.refPlayerState==PlayerState.PLAYING) return;
        this.startAutoRunChords();
        this.refPlayerState = PlayerState.PLAYING;
    }


    handleChordClick(beatNumber) {
        const targetTimeSec =   this.getTimeFromBeatNumber(beatNumber)/1000;
        globalAudioPlayer.currentTime = targetTimeSec + 0.01;


        // handleSeek will be trigger after this
    }


    handleSeek(timestamp){


        clearTimeout(this.nextRunbeatEvent);

        // quick hightlight selected beat
        const beatResult = this.getCurrentBeat(globalAudioPlayer.currentTime * 1000)

        this.highlightBeat(beatResult.currentBeatNumber);

        this.needUrgentScroll = true;


    }

    handlePause(timestamp){
        if (this.refPlayerState==PlayerState.PAUSED) return;


        clearTimeout(this.nextRunbeatEvent);

        this.stopAutoRunChords();
        this.refPlayerState = PlayerState.PAUSED;

    }


    getTimeFromBeatNumber(inputBeatNumber) {
        function getBeatDuration(bpm) {
          return 60000 / bpm;
        }
        const currentChordVersion = globalSongData.chordVersionList[selectingChordVersion];

        let currentBPM = currentChordVersion.mainBpm;
        let totalTime = 0;
        let previousBeatNumber = 0;
        const startChordTimeMs = currentChordVersion.startChord;
      
        const tempoChange = currentChordVersion.tempoChangeList;
      
        if (!tempoChange) return null;
      
        // Iterate through each tempo change event
        for (let i = 0; i < tempoChange.length; i++) {
          const change = tempoChange[i];
          const [beatNumber,newBPM ] = change;
          const beatDuration = this.getBeatDuration(currentBPM);
          const beatsPassed = beatNumber - previousBeatNumber;
      
          // Calculate total time for the beats up to the next tempo change
          const segmentTime = beatsPassed * beatDuration;
      
          // Check if the target inputBeatNumber is within this segment
          if (inputBeatNumber <= beatNumber) {
            const beatsFromPrevious = inputBeatNumber - previousBeatNumber;
            const timeFromPrevious = beatsFromPrevious * beatDuration;
      
            return startChordTimeMs + totalTime + timeFromPrevious;
          }
      
          // Update total time and BPM for the next segment
          totalTime += segmentTime;
          previousBeatNumber = beatNumber;
          currentBPM = newBPM;
        }
      
        // If the inputBeatNumber is beyond the last tempo change
        const finalBeatDuration = this.getBeatDuration(currentBPM);
        const beatsFromPrevious = inputBeatNumber - previousBeatNumber;
        const finalTime = totalTime + (beatsFromPrevious * finalBeatDuration);
      
        return startChordTimeMs + finalTime;
      }
      
      
    getBeatDuration(bpm) {
        return 60000 / bpm;
      }


    getCurrentBeat(currentTimeMs){
      
        const currentChordVersion = globalSongData.chordVersionList[selectingChordVersion];

        if (!currentChordVersion) {
            console.log("currentChordVersion not found")
            return { "currentBeatNumber":-1, "remainingTimeTillNextBeatMs": Infinity };
        }
            

        let currentBPM = currentChordVersion.mainBpm;


        
        let previousBeatNumber = 0;

        
        const startChordTimeMs = currentChordVersion.startChord;
      
        const tempoChange = currentChordVersion.tempoChangeList;
      

      
        
        // Check if current time is before the first beat
        if (currentTimeMs <= startChordTimeMs) {
          const timeBeforeFirstBeat = startChordTimeMs - currentTimeMs;
      
          return { "currentBeatNumber":-1, "remainingTimeTillNextBeatMs": timeBeforeFirstBeat };
        }
        // Adjust current time to account for startChordTimeMs
        const adjustedCurrentTimeMs = currentTimeMs - startChordTimeMs;
      
        if (!tempoChange) return null;


        let timeBeforeSegment = 0;
      
        // Iterate through each tempo change event
        for (let i =0; i<tempoChange.length;i++) {

            const change = tempoChange[i];
            const { beatNumber, bpm: newBPM } = change;
            const beatDuration = this.getBeatDuration(currentBPM);
            const beatsPassed = beatNumber - previousBeatNumber;
      
            // Calculate total time for the beats up to the next tempo change
            const segmentTime = beatsPassed * beatDuration;

      
            // Check if the adjusted current time falls within this segment
            if (adjustedCurrentTimeMs <= timeBeforeSegment + segmentTime) {
                // Calculate the current beat within this segment
                const timeIntoSegment = adjustedCurrentTimeMs - timeBeforeSegment;
                const beatOffset = timeIntoSegment / beatDuration;
                const currentBeatNumber = previousBeatNumber + beatOffset;
                
                // Calculate remaining time till the next beat
                const nextBeatPosition = Math.ceil(beatOffset);
                const nextBeatTime = nextBeatPosition * beatDuration;
                const timeToNextBeat = nextBeatTime - timeIntoSegment;

      
                return { "currentBeatNumber":currentBeatNumber, "remainingTimeTillNextBeatMs": timeToNextBeat };
            }
      
            // Update total time and BPM for the next segment
            timeBeforeSegment += segmentTime;
            previousBeatNumber = beatNumber;
            currentBPM = newBPM;
            if(uiManager){uiManager.updateCurrentBpm(newBPM);}
            

        }
      
        // If the adjusted current time is beyond the last tempo change, handle it here
        const finalBeatDuration =  this.getBeatDuration(currentBPM);
        const beatsPassed = (adjustedCurrentTimeMs - timeBeforeSegment) / finalBeatDuration;
        const finalBeatNumber = previousBeatNumber + beatsPassed;
      
        // Calculate remaining time till the next beat
        const timeIntoFinalSegment = (adjustedCurrentTimeMs - timeBeforeSegment) % finalBeatDuration;
        const timeToNextBeat = finalBeatDuration - timeIntoFinalSegment;
      
        return { "currentBeatNumber": finalBeatNumber, "remainingTimeTillNextBeatMs": timeToNextBeat};
      }
      


    highlightBeat(beatToBlink){

        if (!uiManager) return;


        const beatToBlinkFloor = Math.floor(beatToBlink);

        if (this.lastDrawIdx == beatToBlinkFloor){

            this.runBeat();
            return;
            
        }

        uiManager.onHighlightBeat(this.lastDrawIdx, beatToBlinkFloor, this.needUrgentScroll);

        this.needUrgentScroll = false;


        this.lastDrawIdx = beatToBlinkFloor;




        this.runBeat();
        return;


    }

    runBeat(){


        if (!this.shouldRunBeat) return;
        

        const beatResult = this.getCurrentBeat((globalAudioPlayer.currentTime) * 1000);
        const timeToCallPreciseDraw = Math.max(0, beatResult.remainingTimeTillNextBeatMs) / globalAudioPlayer.playbackRate * 0.9;



        this.nextRunbeatEvent = setTimeout(() => {
           
            this.highlightBeat(beatResult.currentBeatNumber + 1);
        
        }, timeToCallPreciseDraw);


    }



    startAutoRunChords(){
        this.shouldRunBeat = true;
        this.needUrgentScroll = true;
        this.runBeat()

    }



    stopAutoRunChords(){
        this.shouldRunBeat = false;
        clearTimeout(this.nextRunbeatEvent);


    }


    destroy(){

        this.stopAutoRunChords();
        try{
            this.hooker.unhookPlayer();
            this.hooker=null;
        }catch(e){}


    }




}
