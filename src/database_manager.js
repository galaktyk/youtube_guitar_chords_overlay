
const FIREBASE_FUNCTION_MANAGE_URL = "https://manage-song-272bip6eja-uc.a.run.app";
const FIREBASE_FUNCTION_DELETE_URL = "https://delete-chords-version-272bip6eja-uc.a.run.app"


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



class DatabaseManager{

    #databaseUrl = "";


    constructor(databaseUrl)  {

        this.#databaseUrl = databaseUrl;

    }


    /**
     * Fetches a song data from the Firestore database.
     * @param {string} videoId The YouTube video ID of the song.
     * @returns {Promise<SongData|null>} The song data if found, or null if not found.
     */
    async fetchSongFromDatabase(videoId){

        console.log(TAG+ "fetchSongFromDatabase: " + this.#databaseUrl + videoId);
        const fireStoreData = await fetchData(this.#databaseUrl + videoId);

        if (!fireStoreData || fireStoreData === undefined || fireStoreData.fields === undefined){
            console.log("Song data not found in the database");
            return new SongData();
        }


        return new SongData(fireStoreData);
    }



        

    async uploadData(ytId, songName, chordsVersion, stringPassword){

        try{

            const payloadChordsVersion = deepCopyArray(chordsVersion);


            // Convert list to string since firestore not support nested list
            payloadChordsVersion.tempoChangeList = JSON.stringify(payloadChordsVersion.tempoChangeList);
            payloadChordsVersion.chords = payloadChordsVersion.chords.join(",");
    
    
            const payload = {
                // for checking
                "ytId": ytId,
                "songName": songName,
                "password": stringPassword,
    
                // for store
                "chordsVersion": payloadChordsVersion
                
            }
    
    
            const response = await fetch(FIREBASE_FUNCTION_MANAGE_URL, {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), 
            })
 
       
            
            return response;
    
        }
        catch(error){
            return null;
        }
     

    }




    async deleteSong(ytId, uuid, stringPassword){


        const payload = {
            "ytId": ytId,
            "uuid": uuid, // specify which versino to delete
            "password": stringPassword,
        }

        try{
            const response = await fetch(FIREBASE_FUNCTION_DELETE_URL, {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), 
            })
            console.log(response)
            return response;
        }
        catch(error){
            return null;
        }






    }


}
