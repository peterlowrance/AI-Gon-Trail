import { wordsToImage, startingImages } from './image_imports';

const wordWeights = {
    "alien": 1.2,
    "anomaly": 3,
    "nebula": 1.2,
    "space": 1,
    "outerspace": 1.2,
    "ftl": 2,
    "solarstorm": 2,
    "planet": 1,
    "barren": 1,
    "cavern": 1,
    "grass": 1,
    "hostileplanet": 3,
    "lake": 1,
    "mountains": 1,
    "rocks": 1,
    "sand": 1,
    "sun": 1,
    "planets": 2,
    "spaceships": 2,
    "asteroids": 2,
    "spaceship": 2,
    "starship": 2,
    "ufo": 3,
    "enemyspaceship": 2,
    "spacestation": 2,
    "spaceport": 2,
    "asteroid": 2,
    "ion": 2,
    "meteors": 2,
    "autumn": 2,
    "leaves": 1,
    "forest": 1,
    "beach": 1.5,
    "ocean": 1.5,
    "waves": 1,
    "cabana": 2,
    "bear": 1,
    "bears": 1,
    "monsters": 1,
    "monster": 1,
    "dark": 1,
    "blackhole": 3,
    "ionstorm": 3,
    "supernova": 3,
    "bridge": 1,
    "river": 1,
    "cabin": 1.5,
    "trees": 1,
    "fields": 1,
    "campfire": 1,
    "fire": 1,
    "castle": 1,
    "fort": 1,
    "fortress": 1,
    "outpost": 1,
    "cave": 1,
    "caveentrance": 2,
    "underground": 1,
    "stalagmite": 2,
    "stalactite": 2,
    "desert": 1,
    "dusk": 1,
    "sandstorm": 2,
    "cactus": 1,
    "wasteland": 1,
    "heat": 1,
    "deathvalley": 2,
    "dock": 1,
    "dry": 1,
    "evening": 1,
    "hills": 1,
    "snow": 1,
    "winter": 1.5,
    "cold": 1,
    "burning": 1,
    "forestfire": 2,
    "wildfire": 2,
    "flooded": 1,
    "flood": 1,
    "foggy": 1,
    "fog": 1,
    "waterfall": 1.5,
    "woodfort": 2,
    "cloudy": 1,
    "plains": 1,
    "pine": 1,
    "valley": 1,
    "marsh": 1,
    "house": 1,
    "indian": 1.5,
    "nativeamerican": 1.5,
    "nativeamericans": 1.5,
    "indians": 1.5,
    "insects": 1.5,
    "swarm": 1,
    "swarming": 1,
    "bugs": 1.5,
    "insect": 1.5,
    "launching": 1,
    "spacecraft": 2,
    "lighthouse": 2,
    "island": 1.2,
    "shore": 1,
    "lightning": 2,
    "thunder": 2,
    "thunderstorm": 2,
    "void": 1.2,
    "spaceanomaly": 2,
    "ship": 1,
    "snowing": 1,
    "wolves": 1,
    "plants": 1,
    "greenery": 1,
    "portal": 3,
    "warp": 3,
    "teleport": 3,
    "prairie": 1,
    "insectswarm": 2,
    "raining": 1.2,
    "rain": 1,
    "woods": 1,
    "storming": 1.2,
    "rainy": 1,
    "lucious": 1,
    "storm": 1,
    "stones": 1,
    "boulder": 1,
    "rocky": 1,
    "sandy": 1,
    "ice": 1,
    "galaxy": 2,
    "space-station": 2,
    "spaceshiplanded": 2,
    "spaceshiplanding": 2,
    "thrusters": 1.2,
    "sunset": 1,
    "radiationstorm": 2,
    "swamp": 1.5,
    "bog": 1.5,
    "jungle": 1.5,
    "town": 1
};

function getWordWeight(word) {
    if (word in wordWeights)
        return wordWeights[word];
    return 1
}

export function getBackgroundImage(paragraph: string) {
    // If no paragraph, return a starting image
    if (!paragraph) {
        return startingImages[Math.floor(Math.random() * startingImages.length)];
    }
    const wordsArray = paragraph.toLowerCase().replace(/[^a-zA-Z']/g, " ").split(" ");
    // Build map from words to counts
    const wordCounts = wordsArray.reduce((map, str) => map.set(str, (map.get(str) || 0) + 1), new Map<string, number>());
    // Build map from word pairs to counts
    const wordPairs = wordsArray.slice(0, -1).map((word, i) => word + wordsArray[i + 1]);
    const wordPairCounts = wordPairs.reduce((map, str) => map.set(str, (map.get(str) || 0) + 1), new Map<string, number>());
    // Build list of [weight, image] using the counts and word weight map
    const weightsAndImages: [number, any][] = [];
    let maxWeight = 0;
    wordsToImage.forEach(([imageWords, backgroundImage]) => {
        const overlappingWordsWeightsSum = imageWords.reduce((sum, curWord) => {
            if (wordCounts.has(curWord)) {
                return sum + (getWordWeight(curWord) * wordCounts.get(curWord));
            }
            if (wordPairCounts.has(curWord)) {
                return sum + (getWordWeight(curWord) * wordPairCounts.get(curWord));
            }
            return sum;
        }, 0);
        if (overlappingWordsWeightsSum > 0) {
            if (overlappingWordsWeightsSum > maxWeight) {
                maxWeight = overlappingWordsWeightsSum;
            }
            weightsAndImages.push([overlappingWordsWeightsSum, backgroundImage]);
        }
    });
    // Get all words within 65% of the max weight computed
    const allowedWeightDelta = maxWeight * .65;
    const weightsAndImagesCloseToMax = weightsAndImages.filter(([weight, image]) => maxWeight - weight < allowedWeightDelta);
    const totalWeight = weightsAndImagesCloseToMax.reduce((sum, cur) => sum + cur[0], 0);
    // Algorithm to choose an image randomly from the images close to max, uses the weight to skew probability
    let weightLeft = Math.random() * totalWeight;
    for (let i = 0; i < weightsAndImagesCloseToMax.length; i++) {
        weightLeft -= weightsAndImagesCloseToMax[i][0];
        if (weightLeft <= 0) {
            return weightsAndImagesCloseToMax[i][1];
        }
    }
}
