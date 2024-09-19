// Define the chromatic scale, combining flats and sharps
const chromaticScale = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

// Mapping notes to their semitone positions
const noteToSemitone = chromaticScale.reduce((obj, note, index) => {
    obj[note] = index % 12; // Ensure that all notes map within the range 0-11
    return obj;
}, {});

// Function to get the correct note name based on whether we're in a sharp or flat context
function getNoteFromSemitone(semitone, keyType) {
    const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNotes  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    return keyType === 'flat' ? flatNotes[semitone] : sharpNotes[semitone];
}

// Function to detect the key context based on the input notes
function detectKey(notes) {
    let flatCount = notes.filter(note => note.includes('b')).length;
    let sharpCount = notes.filter(note => note.includes('#')).length;
    
    // Guess the key: more flats suggest a flat key, more sharps suggest a sharp key
    return flatCount > sharpCount ? 'flat' : 'sharp';
}

// Function to transpose a note up or down by a number of semitones
function transpose(note, semitones, keyType) {
    let currentSemitone = noteToSemitone[note]; // Get the semitone index of the current note
    let newSemitone = (currentSemitone + semitones + 12) % 12; // Add 12 to handle negative transpositions correctly

    return getNoteFromSemitone(newSemitone, keyType); // Return the correct note (flat/sharp) based on key context
}



function separateChord(chord) {
    const match = chord.match(/^([A-G](?:#|b)?)([mM]?)([a-zA-Z0-9-]*)$/);
    if (match) {
        const rootNote = match[1];
        const quality = match[2] + match[3] 
        return [
             rootNote,
             quality
        ];
    }
    return chord
}