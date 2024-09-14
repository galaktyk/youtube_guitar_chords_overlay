
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

        return /** @type {SongData}*/ new SongData(fireStoreData);
    }


}
