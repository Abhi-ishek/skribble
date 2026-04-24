import Word from "../models/Word.model.js";

/**
 * Generates a random 6-character uppercase alphanumeric string, avoiding 0/O and 1/I.
 */
export const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Fetches N random words from MongoDB using $sample aggregation.
 * @param {number} count 
 * @returns {Promise<string[]>}
 */
export const pickRandomWords = async (count) => {
  try {
    const randomWords = await Word.aggregate([{ $sample: { size: count } }]);
    return randomWords.map((w) => w.word);
  } catch (error) {
    console.error("Error picking random words:", error);
    return [];
  }
};

/**
 * Returns a string of underscores and spaces representing the blank word.
 * @param {string} word 
 * @returns {string}
 */
export const buildBlankHint = (word) => {
  return word
    .split("")
    .map((char) => (char === " " ? " " : "_"))
    .join(" ");
};

/**
 * Randomly reveals revealCount letter positions in the word.
 * @param {string} word 
 * @param {number} revealCount 
 * @returns {string}
 */
export const buildHint = (word, revealCount) => {
  const wordChars = word.split("");
  const indices = [];

  // Get all non-space indices
  for (let i = 0; i < wordChars.length; i++) {
    if (wordChars[i] !== " ") {
      indices.push(i);
    }
  }

  // Pick random indices to reveal
  const revealIndices = new Set();
  const actualRevealCount = Math.min(revealCount, indices.length);
  
  while (revealIndices.size < actualRevealCount) {
    const randomIndex = indices[Math.floor(Math.random() * indices.length)];
    revealIndices.add(randomIndex);
  }

  return wordChars
    .map((char, index) => {
      if (char === " ") return " ";
      return revealIndices.has(index) ? char : "_";
    })
    .join(" ");
};
