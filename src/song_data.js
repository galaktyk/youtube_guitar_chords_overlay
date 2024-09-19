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
    recommendCapo;
    chords;
    mainBpm;
    startChord;
    tempoChangeList;

    isLocal;
    Uuid;

    constructor(chordVersionMap){
    
        this.recommendCapo = getFieldValue(chordVersionMap.mapValue.fields.recommend_capo);
        this.chords = getFieldValue(chordVersionMap.mapValue.fields.chords).split(',');
        this.mainBpm = getFieldValue(chordVersionMap.mapValue.fields.song_bpm);
        this.Uuid = getFieldValue(chordVersionMap.mapValue.fields.uuid);
        this.startChord = getFieldValue(chordVersionMap.mapValue.fields.start_chord) * 1000;
        this.isLocal = false;
        
        const tempoChangeString = getFieldValue(chordVersionMap.mapValue.fields.tempo_change);

        this.tempoChangeList = [];
      
        this.tempoChangeList = JSON.parse(tempoChangeString);


        if (this.tempoChangeList[0][0] !== 0){
            this.tempoChangeList.push(0, this.mainBpm)
        }
       
        this.tempoChangeList.sort((a, b) => a.beatNumber - b.beatNumber);
      
        this.versionName = getFieldValue(chordVersionMap.mapValue.fields.version_name);


        this.creatorName = getFieldValue(chordVersionMap.mapValue.fields.creator_name);
        if (!this.creatorName) this.creatorName = "anon";
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


