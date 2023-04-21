import { wordsToImage, wordCounts, maxWordCount, startingImages } from './image_imports';

function getWordWeight(word) {
   return .5 + ((maxWordCount - wordCounts[word])/maxWordCount);
}

export function getBackgroundImage(paragraph: string) {
    // If no paragraph, return a starting image
    if (!paragraph) {
        return startingImages[Math.floor(Math.random() * startingImages.length)];
    }
    const wordsArray = paragraph.toLowerCase().replace(/[^a-zA-Z']/g, " ").split(" ");
    const words = new Set(wordsArray);
    const wordPairs = new Set(wordsArray.slice(0, -1).map((word, i) => word + words[i + 1]));
    const weightsAndImages: [number, any][] = [];
    let maxWeight = 0;
    wordsToImage.forEach(([imageWords, backgroundImage]) => {
        const overlappingWordsWeightsSum = imageWords.reduce((sum, curWord) => words.has(curWord) || wordPairs.has(curWord) ? sum + getWordWeight(curWord): sum, 0);
        if (overlappingWordsWeightsSum > 0) {
            if (overlappingWordsWeightsSum > maxWeight) {
                maxWeight = overlappingWordsWeightsSum;
            }
            weightsAndImages.push([overlappingWordsWeightsSum, backgroundImage]);
        }
    });
    const allowedWeightDelta = maxWeight / 10;
    const imagesCloseToMaxWeight = weightsAndImages.filter(([weight, image]) => maxWeight - weight < allowedWeightDelta).map(([weight, image]) => image);
    return imagesCloseToMaxWeight[Math.floor(Math.random() * imagesCloseToMaxWeight.length)];
}

// counts, combine two words, have versions without 's'