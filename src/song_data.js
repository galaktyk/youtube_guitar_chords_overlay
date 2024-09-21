function getFieldValue(field){

    if (!field) return "";

    if (field.stringValue !== undefined) {
        return field.stringValue; 

    } 

    else if (field.integerValue !== undefined) {
        return Number(field.integerValue);

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
    startChord;
    tempoChangeList;

    isLocal;
    uuid;

    constructor(chordVersionMap){

        // Create empty chord data if chordVersionMap is null
        if (!chordVersionMap){

            this.recommendCapo = 0;
            this.chords = Array.from({ length: 200 }, () => '');
            this.uuid = "";
            this.startChord = 0;
            this.isLocal = true;
            this.tempoChangeList = [];
            this.creatorName = "anon";
            this.versionName = "untitled";
            this.passwordHash = "";


            return;
        }





    
        this.recommendCapo = getFieldValue(chordVersionMap.mapValue.fields.recommendCapo);
        this.chords = getFieldValue(chordVersionMap.mapValue.fields.chords).split(',');
        this.uuid = getFieldValue(chordVersionMap.mapValue.fields.uuid);
        this.startChord = getFieldValue(chordVersionMap.mapValue.fields.startChord);
        this.isLocal = false;
        
        this.tempoChangeList = JSON.parse(getFieldValue(chordVersionMap.mapValue.fields.tempoChangeList));

       

        


       
        this.tempoChangeList.sort((a, b) => a[0] - b[0]);
      
        this.versionName = getFieldValue(chordVersionMap.mapValue.fields.versionName);


        this.creatorName = getFieldValue(chordVersionMap.mapValue.fields.creatorName);
        if (!this.creatorName) this.creatorName = "anon";
        this.passwordHash = getFieldValue(chordVersionMap.mapValue.fields.passwordHash);
       
    }




}


class SongData{

    songName;
    chordVersionList;

    constructor(fireStoreData){

        if (fireStoreData){

            this.songName = getFieldValue(fireStoreData.fields.song_name);
            this.chordVersionList = [];

            const chordsVersions = fireStoreData.fields.chordsVersions.arrayValue.values;
            chordsVersions.forEach(chordVersionMap => {

                this.chordVersionList.push(new ChordData(chordVersionMap));

                });
                

        }else{
            this.songName = "Not found";
            this.chordVersionList = [];
        }
        

    }




}


