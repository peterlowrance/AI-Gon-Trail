import os
import json
from collections import defaultdict

all_file_obj = {}
starting_images = []
word_counts = defaultdict(lambda: 0)

for file in os.listdir("."):
  # Check if the file has a .jpg extension
  if file.endswith(".jpg"):
    if file.startswith('town'):
        starting_images.append(file)
    else:
        # Split the file name by '_' and store it as a list
        word_list = []
        for word in file.split('_'):
            if '.jpg' not in word:
                word_list.append(word)
                word_counts[word] += 1

        # Add the file name and the list as a key-value pair to the result dictionary
        all_file_obj[file] = word_list

# Create javascript file to import and manage the files
with open('image_imports.ts', 'wt') as f:
    for i, filename in enumerate(starting_images):
        f.write(f"import starting_background{i} from './{filename}';\n")
    for i, filename in enumerate(all_file_obj):
        f.write(f"import background{i} from './{filename}';\n")
    f.write('\n')
    f.write(f'export const startingImages = [')
    for i, filename in enumerate(starting_images):
        f.write(f'starting_background{i}, ')
    f.write(']\n')
    f.write("export const wordsToImage: [string[], any][] = [\n")
    for i, words in enumerate(all_file_obj.values()):
        f.write(f'    [{words}, background{i}],\n')
    f.write(']\n\n')
    f.write(f'export const wordCounts = {json.dumps(word_counts)}\n')
    f.write(f'export const maxWordCount = {max(c for c in word_counts.values())}')
    