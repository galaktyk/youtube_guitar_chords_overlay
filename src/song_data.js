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


function parseTempoChanges(tempoChangeString, mainBpm) {
    let tempoChangeList = [];

    tempoChangeList = JSON.parse(tempoChangeString);

    if (!tempoChangeList || tempoChangeList.length === 0) tempoChangeList = [[0, mainBpm]];

    if (tempoChangeList.length > 0 && tempoChangeList[0][0] !== 0){
        tempoChangeList.push([0, mainBpm])

    }

    return tempoChangeList;

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

        // Create empty chord data if chordVersionMap is null
        if (!chordVersionMap){

            this.recommendCapo = 0;
            this.chords = Array.from({ length: 200 }, () => '');
            this.mainBpm = 120;
            this.Uuid = "";
            this.startChord = 0;
            this.isLocal = true;
            this.tempoChangeList = [[0, this.mainBpm]];
            this.creatorName = "anon";
            this.versionName = "untitled";


            return;
        }





    
        this.recommendCapo = getFieldValue(chordVersionMap.mapValue.fields.recommend_capo);
        this.chords = getFieldValue(chordVersionMap.mapValue.fields.chords).split(',');
        this.mainBpm = getFieldValue(chordVersionMap.mapValue.fields.song_bpm);
        this.Uuid = getFieldValue(chordVersionMap.mapValue.fields.uuid);
        this.startChord = getFieldValue(chordVersionMap.mapValue.fields.start_chord) * 1000;
        this.isLocal = false;
        
        const tempoChangeString = getFieldValue(chordVersionMap.mapValue.fields.tempo_change);

        this.tempoChangeList = parseTempoChanges(tempoChangeString, this.mainBpm);

        


       
        this.tempoChangeList.sort((a, b) => a[0] - b[0]);
      
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


