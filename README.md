# youtube_guitar_chords_overlay
A Chrome extension that detects YouTube or YouTube Music URLs and displays a guitar chord overlay.
(The chords are loaded from my own database.)




![example](assets/example_2.gif)


## Song database

[example list](https://www.youtube.com/playlist?list=PLFVrghbPJS58f8FIxA-cZVBMfWzxEwXZ6)

Currently only have a song that I'm practicing, feel free to add your own song via the plugin (check the Create/Edit section)





## Installation
- download this repo as zip and extract
- goto `chrome://extensions` and Enable developer mode
- click `Load unpacked` and select `src/` folder





## Basic usage
1. Open youtube video ([example](https://www.youtube.com/watch?v=BciS5krYL80)) and click on "Guitar 🎸 icon" above video to open the window


![](assets/open_plugin.jpg)
\
![example](assets/ui.jpg)
  

Tips:
- Seek the video also affect the plugin
- Change YouTube's playback speed will also affect the plugin
- Click on the beat box will also affect YouTube's video progress
- You can use Ctrl + Left/Right arrow key to change capo

## Create/Edit mode
When open a song you can create a new chords version by using the `Create new` button
or edit the existing one by using `Edit mode` button

![example](assets/edit_mode.jpg)
  
    






|   |   |
|---|---|
| Beat box | You can enter/edit chord name in this box, beat number is on the top left, chord image will show if it match any in [list](src/chord_icons/)|
| Chord start  |  Time in milliseconds before play the first chord |
| Tempo change list  | Pair of [beat, tempo value] for changing tempo in the song|
| Raw chords | Chord list in text format for backup, quick edit, add beats|

Tips:
- Some song might have inconsistent beat, you can edit `Tempo change list` to mimic the played tempo
- You can add more beat box by adding `,,,,,,` text in the `Raw chords`



## TODO
- [ ] chord shape variations
- [ ] pitch shift audio 
