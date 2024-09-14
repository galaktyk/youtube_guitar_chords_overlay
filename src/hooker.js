



const HostType = Object.freeze({
  YOUTUBE: Symbol('YOUTUBE'),
  YOUTUBE_MUSIC: Symbol('YOUTUBE_MUSIC'),
  UNDEFINED: Symbol('UNDEFINED')
});



function checkHostType(){

  
  const url = new URL(window.location.href);

  if (url.href.includes("music.youtube")){
    
    return  HostType.YOUTUBE_MUSIC;
  }
  else if (url.href.includes("youtube")){
  
    return HostType.YOUTUBE;
  }
  else{
    return  HostType.UNDEFINED;

  }
}



function getYoutubePlayer()
{
  const player = document.querySelector('video');
  if (!player)return;
  return player;
}


function getYoutubeMusicPlayer()
{
  const playerWrapper = document.querySelector('ytmusic-player');
  if (!playerWrapper || playerWrapper==null)return;
  player = playerWrapper.querySelector('video');
  if (!player)return;
  return player;
}



class Hooker{

    hookCount;
    retryLimit = 50;

    hookIntervalId;
    hostType;



    constructor(){
       
        this.hookCount = 0;

    }


    tryHook(){


    
        if ( this.hookCount >  this.retryLimit){
          clearTimeout(this.hookIntervalId)
          console.log(TAG + "Hook player exceed the limit")
        }

        this.hookCount ++;
        console.log("try hook again")


    

        switch(this.hostType){
            case HostType.YOUTUBE:
              globalAudioPlayer = getYoutubePlayer();
                break;
        
            case HostType.YOUTUBE_MUSIC:    
            globalAudioPlayer = getYoutubeMusicPlayer();
                break;
        }
    
    
        if (!globalAudioPlayer) {
            
            console.log(TAG + "Hook player failed, try again ...")
            this.hookIntervalId = setTimeout(()=> this.tryHook(), 500);
            return;
        }
        else{


            console.log(TAG + "Hook player success")

            
            this.hookPlayer();
            //this.dispatchEvent(new CustomEvent('onHookPlayerSuccess', {detail: {}}));



            return;
        }
  
    }


    startHooking(){
      this.hookCount = 0;
      this.hostType = checkHostType();
      console.log(TAG + "startHooking: " + this.hostType.description)
      if (this.hostType != HostType.UNDEFINED){
        this.tryHook();
      }
      else {
        console.log(TAG + "cannot hook: HostType UNDEFINED")
      }
    }



    hookPlayer()
    {
      if (!globalAudioPlayer)return;
  
      // First check.
      if (globalAudioPlayer.paused){
  
        beatRunner.handlePause(globalAudioPlayer.currentTime);
  
      } else if (!globalAudioPlayer.paused){

        console.log(TAG+ "onHookPlayerSuccess: player already playing")
  
        beatRunner.handlePlay(globalAudioPlayer.currentTime);
      }
  
      
      globalAudioPlayer.onplaying = () => {
        console.log(TAG+ "onHookPlayerSuccess: player playing")
        beatRunner.handlePlay(globalAudioPlayer.currentTime);
      }
  
       

  
      globalAudioPlayer.onpause= () => {
        console.log(TAG+ "onHookPlayerSuccess: player paused")
        beatRunner.handlePause(globalAudioPlayer.currentTime);
      }
  
      globalAudioPlayer.onseeked= () => {
        console.log(TAG+ "onHookPlayerSuccess: player seeked")
        beatRunner.handleSeek(globalAudioPlayer.currentTime);
      }
  
    }


    

    unhookPlayer(){

      globalAudioPlayer.onplaying = null;
      globalAudioPlayer.onpause = null;
      globalAudioPlayer.onseeked = null;  
    }






}
  