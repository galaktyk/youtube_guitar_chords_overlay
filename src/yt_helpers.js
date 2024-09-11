/**
 * Returns the YouTube player element if it exists on the page.
 * 
 * @returns {Element} The YouTube player element, or null if not found.
 */
function getYoutubePlayer()
{
  const player = document.querySelector('video');
  if (!player)return;
  return player;
}


/**
 * Returns the YouTube player element if it exists on the page.
 * 
 * @returns {Element} The YouTube player element, or null if not found.
 */
function getYoutubeMusicPlayer()
{
  const playerWrapper = document.querySelector('ytmusic-player');
  if (!playerWrapper || playerWrapper==null)return;
  player = playerWrapper.querySelector('video');
  if (!player)return;
  return player;
}





function hookPlayerEvents(player, handlePlay, handlePause)
{
  if (!player)return false;

  // First check.
  if (player.paused){
    handlePause(player.currentTime);
  } else if (!player.paused){
    handlePlay(player.currentTime);
  }

  
  player.onplaying = function() {
    handlePlay(player.currentTime);

  }

  player.onpause = function() {
    handlePause(player.currentTime);
  }

  player.onseeked = function(){
    handleSeek(player.currentTime);
  }

  return true;



}
