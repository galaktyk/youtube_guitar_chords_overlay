function getFieldValue(field){

    if (!field) return "";

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





class ChordData{

    creatorName;
    passwordHash;

    versionName;
    capo;
    chords;
    mainBpm;
    startChord;
    tempoChangeList;

    constructor(chordVersionMap){
    
        this.capo = getFieldValue(chordVersionMap.mapValue.fields.capo);
        this.chords = getFieldValue(chordVersionMap.mapValue.fields.chords).split(',');
        this.mainBpm = getFieldValue(chordVersionMap.mapValue.fields.song_bpm);
        this.startChord = getFieldValue(chordVersionMap.mapValue.fields.start_chord) * 1000;
        
        const tempoChangeString = getFieldValue(chordVersionMap.mapValue.fields.tempo_change);
      
        this.tempoChangeList = JSON.parse(tempoChangeString).map(item => {
            if (item.trim() === "") {
                // Handle the empty string case, you might want to return null or skip it
                return null;
            }
            const [beatNumber, bpm] = item.split(',').map(Number);
            return { beatNumber, bpm };
        }).filter(item => item !== null);
        

        this.tempoChangeList = [];
        this.tempoChangeList.push({ beatNumber:0, bpm:this.mainBpm})
        this.tempoChangeList.sort((a, b) => a.beatNumber - b.beatNumber);
      
        this.versionName = getFieldValue(chordVersionMap.mapValue.fields.version_name);


        this.creatorName = getFieldValue(chordVersionMap.mapValue.fields.creator_name);
        if (!this.creatorName) this.creatorName = "Anonymous";
        this.passwordHash = getFieldValue(chordVersionMap.mapValue.fields.password_hash);
       
    }




}


class SongData{

    songName;
    chordVersionList;

    constructor(fireStoreData){

        if (fireStoreData){

            this.songName = getFieldValue(fireStoreData.fields.song_name);
            this.chordVersionList = [];

            const chordVersions = fireStoreData.fields.chords_versions.arrayValue.values;
            chordVersions.forEach(chordVersionMap => {

                this.chordVersionList.push(new ChordData(chordVersionMap));

                });
                

        }else{
            this.songName = "Not found";
            this.chordVersionList = [];
        }
        

    }




}