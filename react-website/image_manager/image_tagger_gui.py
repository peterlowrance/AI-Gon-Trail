import os
import json
import glob
import random
from collections import defaultdict
from tkinter import *
from PIL import Image, ImageTk

class Tag(Frame):
    def __init__(self, master, text, command):
        super().__init__(master)
        self.label = Label(self, text=text, relief="solid", padx=5, pady=2)
        self.label.pack(side="left")
        self.label.bind('<Button-1>', lambda event: command())

class ImageManager:
    def __init__(self, root, images_path="./images/"):
        self.root = root
        self.images_path = images_path
        self.image_files = glob.glob(os.path.join(images_path, "*.jpg"))
        self.image_files = sorted(self.image_files, key=lambda x: (x.count('.') != 2, x))
        self.current_image = 0
        def file_to_words(filename):
            return [w for w in os.path.basename(filename).split('.')[0].split('_') if bool(w) and not w.isdigit()]
        self.words = [file_to_words(img) for img in self.image_files]
        
        self.root.title("Image Manager")
        self.root.geometry("800x600")

        self.preview_frame = Frame(self.root)
        self.preview_frame.pack()

        self.image_label = Label(self.root)
        self.image_label.pack()

        self.tags_frame = Frame(self.root)
        self.tags_frame.pack()

        self.new_tag_entry = Entry(self.root)
        self.new_tag_entry.pack()
        self.new_tag_entry.bind('<Return>', self.add_tag)

        Button(self.root, text="Previous", command=self.previous_image).pack(side=LEFT)
        Button(self.root, text="Next", command=self.next_image).pack(side=LEFT)
        Button(self.root, text="Save", command=self.save_images).pack(side=LEFT)

        self.root.bind('<Left>', self.previous_image)
        self.root.bind('<Right>', self.next_image)

        self.image_cache = {}

        self.show_image()

    def show_image(self):
        tk_img = self.load_image(self.image_files[self.current_image], (550,550))
        self.image_label.config(image=tk_img)
        self.image_label.image = tk_img

        for widget in self.tags_frame.winfo_children():
            widget.destroy()

        for i, word in enumerate(self.words[self.current_image]):
            tag = Tag(self.tags_frame, word, command=lambda i=i: self.remove_tag(i))
            # tag.bind('<Button-1>', lambda event, i=i: self.remove_tag(i))
            tag.pack(side="left")
        self.show_previews()
    
    def show_previews(self):
        for widget in self.preview_frame.winfo_children():
            widget.destroy()

        for i in range(-8, 9):
            preview_index = (self.current_image + i)
            if preview_index < 0 or preview_index >= len(self.image_files):
                img = Image.new(mode="RGB", size=(100, 100), color=(255, 255, 255))
                img.thumbnail((100, 100))
                tk_img = ImageTk.PhotoImage(img)
            else:
                preview_path = self.image_files[preview_index]
                tk_img = self.load_image(preview_path, (100, 100))
            preview_label = Label(self.preview_frame, image=tk_img)
            preview_label.image = tk_img
            preview_label.pack(side="left")
            preview_label.bind('<Button-1>', lambda event, index=preview_index: self.go_to_image(index))

    def remove_tag(self, index):
        del self.words[self.current_image][index]
        self.show_image()

    def add_tag(self, event):
        new_tag = self.new_tag_entry.get()
        if new_tag:
            self.words[self.current_image].append(new_tag)
            self.new_tag_entry.delete(0, END)
            self.show_image()

    def go_to_image(self, index):
        self.current_image = index
        self.show_image()

    def next_image(self, event=None):
        self.test_paragraph_match("The space station was fully functional")
        self.current_image = (self.current_image + 1) % len(self.image_files)
        self.show_image()

    def previous_image(self, event=None):
        self.current_image = (self.current_image - 1) % len(self.image_files)
        self.show_image()

    def load_image(self, file_path, size):
        key = file_path + str(size[0])
        if file_path in self.image_cache:
            return self.image_cache[key]
        else:
            img = Image.open(file_path)
            img.thumbnail(size)
            tk_img = ImageTk.PhotoImage(img)
            self.image_cache[key] = tk_img
            return tk_img


    def test_paragraph_match(self, paragraph):
        # If no paragraph, return a starting image
        starting_images = [] # define starting images
        if not paragraph:
            return random.choice(starting_images)

        # TODO: clean this up
        def get_word_weight(w):
            word_counts = {"blackhole": 2, "ionstorm": 2, "space": 10, "supernova": 3, "warp": 2, "spaceanomoly": 2, "ftl": 2, "alien": 27, "nebula": 7, "anomoly": 2, "asteroid": 3, "ion": 2, "asteroids": 3, "meteors": 1, "beach": 3, "ocean": 5, "waves": 2, "cabana": 1, "bear": 2, "bears": 2, "monsters": 1, "monster": 1, "dark": 2, "campfire": 1, "fire": 2, "forest": 6, "castle": 3, "fort": 4, "fortress": 3, "outpost": 1, "cave": 5, "caveentrance": 2, "underground": 3, "cavern": 4, "stalagmite": 1, "stalactite": 1, "dock": 1, "lake": 10, "burning": 1, "forestfire": 1, "wildfire": 1, "woodfort": 1, "spaceship": 10, "starship": 7, "spaceshiplanded": 1, "spaceshiplanding": 1, "spacecraft": 4, "launching": 1, "lighthouse": 2, "shore": 1, "island": 1, "ship": 1, "plants": 1, "greenery": 1, "portal": 1, "teleport": 1, "sandy": 1, "outerspace": 2, "space-station": 1, "sunset": 1, "pine": 10, "radiationstorm": 1, "solarstorm": 2, "anomaly": 2, "planet": 19, "hostileplanet": 1, "barren": 1, "grass": 18, "mountains": 8, "rocks": 5, "sand": 6, "sun": 1, "planets": 1, "spaceships": 1, "ufo": 1, "enemyspaceship": 1, "spacestation": 5, "spaceport": 4, "alient": 1, "autumn": 2, "leaves": 2, "bridge": 2, "river": 13, "cabin": 2, "trees": 4, "fields": 2, "desert": 7, "dusk": 3, "sandstorm": 1, "cactus": 2, "wasteland": 2, "heat": 3, "deathvalley": 2, "dry": 2, "evening": 2, "hills": 12, "snow": 9, "winter": 9, "cold": 1, "flooded": 1, "flood": 2, "foggy": 3, "fog": 3, "waterfall": 2, "cloudy": 2, "plains": 2, "valley": 2, "marsh": 1, "house": 1, "indian": 4, "nativeamerican": 7, "nativeamericans": 4, "indians": 4, "insects": 2, "swarm": 1, "swarming": 1, "bugs": 1, "insect": 1, "lightning": 1, "thunder": 2, "thunderstorm": 2, "void": 1, "snowing": 3, "wolves": 2, "prairie": 2, "insectswarm": 1, "raining": 1, "rain": 2, "woods": 1, "storming": 2, "rainy": 2, "lucious": 1, "storm": 1, "stones": 3, "boulder": 2, "rocky": 2, "ice": 3, "galaxy": 1, "thrusters": 1, "swamp": 3, "bog": 3, "jungle": 1, "town": 9}
            return .5 + ((27 - word_counts[w])/27);

        words_array = paragraph.lower().replace(r"[^a-zA-Z']", " ").split()
        words = set(words_array)
        word_pairs = set([words_array[i] + words_array[i+1] for i in range(len(words_array)-1)])
        weights_and_images = []
        max_weight = 0
        for i, image_words in enumerate(self.words):
            overlapping_words_weights_sum = sum(get_word_weight(cur_word) for cur_word in image_words if cur_word in words or cur_word in word_pairs)
            if overlapping_words_weights_sum > 0:
                if overlapping_words_weights_sum > max_weight:
                    max_weight = overlapping_words_weights_sum
                weights_and_images.append((overlapping_words_weights_sum, i))
        allowed_weight_delta = max_weight / 10
        images_close_to_max_weight = [image for weight, image in weights_and_images if max_weight - weight < allowed_weight_delta]
        for i in images_close_to_max_weight:
            preview_path = self.image_files[i]
            tk_img = self.load_image(preview_path, (100, 100))
            matching_image = Label(self.root, image=tk_img)
            matching_image.image = tk_img
            matching_image.pack(side="left")
        return random.choice(images_close_to_max_weight)

    def save_images(self):
        all_file_obj = {}
        starting_images = []
        word_counts = defaultdict(lambda: 0)
        for i, img in enumerate(self.image_files):
            new_words = self.words[i]
            new_filename = "_".join(new_words) + f".{i}.jpg"
            new_path = os.path.join(self.images_path, new_filename)

            if img != new_path:
                os.rename(img, new_path)
                self.image_files[i] = new_path
                self.words[i] = new_words
            for w in new_words:
                word_counts[w] += 1
            if new_filename.startswith('town'):
                starting_images.append(new_filename)
            else:
                # Add the file name and the list as a key-value pair to the result dictionary
                all_file_obj[new_filename] = new_words
    
        # Create javascript file to import and manage the files
        with open('image_imports.ts', 'wt') as f:
            for i, filename in enumerate(starting_images):
                f.write(f"import starting_background{i} from './images/{filename}';\n")
            for i, filename in enumerate(all_file_obj):
                f.write(f"import background{i} from './images/{filename}';\n")
            f.write('\n')
            f.write(f'export const startingImages = [')
            for i, filename in enumerate(starting_images):
                f.write(f'starting_background{i}, ')
            f.write('];\n')
            f.write("export const wordsToImage: [string[], any][] = [\n")
            for i, words in enumerate(all_file_obj.values()):
                f.write(f'    [{words}, background{i}],\n')
            f.write('];\n\n')
            f.write(f'export const wordCounts = {json.dumps(word_counts)};\n')
            f.write(f'export const maxWordCount = {max(c for c in word_counts.values())};\n')
            


if __name__ == "__main__":
    root = Tk()
    app = ImageManager(root)
    root.mainloop()
