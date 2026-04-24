import Word from "../models/Word.model.js";

const wordsToSeed = [
  // Animals
  { word: "Elephant", category: "animals" },
  { word: "Giraffe", category: "animals" },
  { word: "Penguin", category: "animals" },
  { word: "Tiger", category: "animals" },
  { word: "Kangaroo", category: "animals" },
  { word: "Octopus", category: "animals" },
  { word: "Dolphin", category: "animals" },
  { word: "Zebra", category: "animals" },
  { word: "Panda", category: "animals" },
  { word: "Squirrel", category: "animals" },

  // Objects
  { word: "Telephone", category: "objects" },
  { word: "Bicycle", category: "objects" },
  { word: "Umbrella", category: "objects" },
  { word: "Keyboard", category: "objects" },
  { word: "Backpack", category: "objects" },
  { word: "Scissors", category: "objects" },
  { word: "Flashlight", category: "objects" },
  { word: "Notebook", category: "objects" },
  { word: "Microscope", category: "objects" },
  { word: "Sunglasses", category: "objects" },

  // Actions
  { word: "Running", category: "actions" },
  { word: "Dancing", category: "actions" },
  { word: "Swimming", category: "actions" },
  { word: "Painting", category: "actions" },
  { word: "Climbing", category: "actions" },
  { word: "Singing", category: "actions" },
  { word: "Cooking", category: "actions" },
  { word: "Reading", category: "actions" },
  { word: "Sleeping", category: "actions" },
  { word: "Laughing", category: "actions" },

  // Food
  { word: "Hamburger", category: "food" },
  { word: "Spaghetti", category: "food" },
  { word: "Pineapple", category: "food" },
  { word: "Broccoli", category: "food" },
  { word: "Chocolate", category: "food" },
  { word: "Pancake", category: "food" },
  { word: "Burrito", category: "food" },
  { word: "Cupcake", category: "food" },
  { word: "Watermelon", category: "food" },
  { word: "Popcorn", category: "food" },

  // Places
  { word: "Hospital", category: "places" },
  { word: "Library", category: "places" },
  { word: "Airport", category: "places" },
  { word: "Mountain", category: "places" },
  { word: "Beach", category: "places" },
  { word: "School", category: "places" },
  { word: "Museum", category: "places" },
  { word: "Forest", category: "places" },
  { word: "Desert", category: "places" },
  { word: "Park", category: "places" },
];

export const seedWords = async () => {
  try {
    const count = await Word.countDocuments();
    if (count === 0) {
      await Word.insertMany(wordsToSeed);
      console.log(`Successfully seeded ${wordsToSeed.length} words.`);
    } else {
      console.log("Words collection already seeded.");
    }
  } catch (error) {
    console.error("Error seeding words:", error);
  }
};
