from typing import TypedDict
from api.game_state import GameState
import json
from api.item_parser import ItemParser, Item
import random

class Prompt(TypedDict):
    prompt: str
    temperature: float
    validation_schema: dict | None

def get_start_prompt(theme: str) -> Prompt:
    return {
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme of "{theme}". Respond with a JSON object that shows the available items to purchase at the start of the game. Include a field "items" which is a map with keys of the item and value of the cost in the local currency. They will start with 100 to spend. There should be 20 items. The items should be things that can be stored in the vehicle and that the group can use to overcome various challenges. "characters" is an array of 5 strings with the character's names. "vehicle" is a string and has (Health: 10/10). Include a field destination which is the characters destination. Include a field description which describes the group preparing to start out on their journey based on the theme. Each item, character, and the vehicle can have modifiers for extraneous features, shown in parentheses with the item name, for example "gun (broken)", " or "shovel (strong, steel)". Half of the items have modifiers. All the fields should match the theme.
Example:
{{
	"items": {{"shovel (steel)": 12, "hunting knife": 15, "rations (stale)": 3}},
	"characters": ["Bob (healthy, cartographer)", ...],
	"vehicle": "Wagon (Health 10/10)",
	"destination": "The west",
	"description": "The group sets out..."
}}""",
        "temperature": 0.7,
        "validation_schema": {"items": {"*": int}, "characters": [str], "vehicle": str, "destination": str, "description": str}
    }

def get_validate_action_prompt(scenario: str, state: GameState, action: str) -> Prompt:
    return {
        "prompt": f"""Your job is to determine whether or not a players action is recommended and if it is valid (humanly possible). Since this is a fictional story game, unethical, dangerous, dumb, and harmful actions are valid. If the player action involves a physical object not in the Scenario, Available items, or reasonably obtainable in the environment, it is not valid. If the action is not an attempt to face the scenario or is unrelated, it is not valid.

Scenario: "{scenario}"
Available items: {', '.join(state.items)}
Characters: {', '.join(state.characters)}
Players action: "{action}"

Is this player action valid? Respond in the JSON format {{"recommended": true or false, "valid": true or false, "explanation": "..."}}""",
        "temperature": 0.1,
        "validation_schema": {"recommended": bool, "valid": bool, "explanation": str}
    }

def get_scenario_prompt(state: GameState) -> Prompt: 
    return {
        "prompt": f"""This is a game similar to Oregon Trail with a theme {state.theme}.
The state of the game before encountering the situation is items: "{', '.join(state.items)}"; characters: "{', '.join(state.characters)}"; and vehicle: {state.vehicle}.

The situation they are about to face is "{state.situations[state.current_step - 1]}". It will be a {state.get_difficulty()} challenge that they will have to overcome in order to progress.
Respond with a JSON object with fields "situation" and "suggestions". "situation" is 75 words third person present tense story description of the situation, it is a part of the existing larger story of the game. "suggestions" is an array of 3 brief actions that could possibly be taken to attempt to overcome the scenario (they can be funny/far out there). Make the "situation" not include vague descriptions like "a party member falls ill" but instead specific details such as the character's name and name of the illness. "situation" only describes the challenging situation, not the possible solutions, suggested actions, or character dialog.""",
        "temperature": .6,
        "validation_schema": {"situation": str, "suggestions": [str]}
    }


def get_scenario_list_prompt(theme: str, destination: str) -> Prompt:
    return {
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme of "{theme}" with the goal of reaching "{destination}". Your job is to generate 10 short situations of various difficulty levels for the player to encounter on their journey to {destination} that they will try to overcome.
The situations should make sense with the theme. The situations should involve challenges that need to be overcome such as weather, terrain, wildlife, health, conflicts, ethical dilemmas or other types that match the theme. For each situation, only mention the challenge/obstacle and not how to overcome it. None of the situations should mention the players supplies as those are handled elsewhere. Some situations can be funny, ironic, crazy, or far out there.
Reply in JSON in this format {{"situations":["Cross a river...", ...]}}. Try to make them unique and interesting.""",
        "temperature": .8,
        "validation_schema": {"situations": [str]}
    }

def get_scenario_outcome_prompt_v2(scenario: str, player_action: str, state: GameState) -> Prompt:
    quote_type = random.choice(['funny', 'humerous', 'sarcastic', 'ironic', 'deadpan', 'joking', 'iconic'])
    example_item = Item(random.choice(state.items) if len(state.items) > 0 else 'shovel')
    another_example_item = Item(random.choice(state.items) if len(state.items) > 0 else 'lumber')
    example_item_changed = example_item.clone()
    # Either add or removed the 'damaged' modifier as an example
    if 'damaged' not in example_item_changed.modifiers:
        example_item_changed.modifiers.append('damaged')
    else:
        example_item_changed.modifiers = [m for m in example_item_changed.modifiers if m != 'damaged']

    example_character = Item(random.choice(state.characters))
    example_character_changed = example_character.clone()
    # Either add or removed the 'injured' modifier as an example
    if 'injured' not in example_character_changed.modifiers:
        example_character_changed.modifiers.append('injured')
    else:
        example_character_changed.modifiers = [m for m in example_character_changed.modifiers if m != 'injured']
    return {
        "prompt": f"""This is a game similar to Oregon Trail with a theme of {state.theme}. You control the world in an attempt to make the game engaging and realistic. The concept of time passing isn't important in this game.
Previous game state:
{{
    "items": {json.dumps(state.items)},
    "characters": {json.dumps(state.characters)},
    "vehicle": "{state.vehicle}"
}}
Scenario: "{scenario}"
The player action is "{player_action}"
Consider the risk factor and effectiveness of the player's action when generating the outcome. If the action seems insufficient or unlikely to prevent damage, introduce negative consequences that logically stem from the player's choice. Make the outcome more realistic by considering the actual effectiveness of the chosen action in addressing the core challenges of the scenario, and include any negative consequences that may arise due to the chosen action. Negative consequences can lose items, kill characters, lower vehicle health, and change items or characters to add negative modifiers. For example, if the player chooses to cook a meal to pass through a treacherous mountain pass, the outcome should include both the positive effects of the meal (increased energy and morale) and the negative consequences of not directly addressing the challenges of the mountain pass (injuries, vehicle damage, and lost items). If the vehicle is unusable after the outcome, set its health to 0.
Respond with a JSON object with the following fields to describe the status after the outcome is completed:
"outcome" is a story-like description of the outcome,
"items_lost" is the list of items that were lost,
"items_gained" is the list of items gained,
"items_changed" is a map of items to the item with changed modifiers in parenthesis,
"characters_lost" is the characters that have died or were lost,
"characters_gained" are any new characters,
"characters_changed" is a map of character to the character with changed modifiers in parenthesis,
and "vehicle" is the vehicle with updated health (if it changed).
Fill these out based on the action and the outcome. The outcome should conclude the scenario so the next scenario can be faced. If a change happened to an item or character you must include them in "items_changed" or "characters_changed" with a full list of their modifiers in parenthesis, including their original modifiers (if they still apply); example "characters_changed": {{"John (hunter)": "John (sick, hunter)"}}. Example: "items_changed": {{"blanket": "blanket (wet)"}}. Only include things in "items_changed" or "characters_changed" when the modifiers change (logically based on the story). Any one entity shouldn't have more than 3 modifiers and some modifiers can go away over time. "quote" is a {quote_type} thing that a character said about the outcome. The scenario is {state.get_difficulty()} difficulty but extremely negative outcomes should be rare.
Example format:
{{"outcome": "description", "items_lost": ["{another_example_item}"], "items_gained": [], "items_changed": {{"{example_item}": "{example_item_changed}", ...}}, "characters_lost": ["{state.characters[0]}"], "characters_gained": [], "characters_changed": {{"{example_character}": "{example_character_changed}", ...}}, "vehicle": "{state.vehicle}", "quote": "{Item(random.choice(state.characters)).key}: In hindsight..."}}""",
        "temperature": .8,
        "validation_schema": {"outcome": str, "items_lost": [str], "items_gained": [str], "items_changed": {'*': str}, "characters_lost": [str], "characters_gained": [str], "characters_changed": {'*': str}, "vehicle": str, "quote": str}
    }

def get_game_end_prompt(prev_outcome: str, state: GameState) -> Prompt:
    dest = 'successfully reached their destination' if state.game_over == 'WIN' else 'failed trying to reach their destination'
    if state.game_over == 'WIN':
        end_reason = f'reaching their destination {state.destination}'
    else:
        end_reason = 'losing because all the characters died' if len(state.characters) == 0 else "losing because the vehicle didn't survive"

    old_character_parser = ItemParser(state.original_characters)
    new_character_parser = ItemParser(state.characters)
    added, removed, changed = old_character_parser.difference(new_character_parser)
    end_characters = ''
    if len(removed) > 0:
        end_characters = f' and {", ".join(removed)} didn\'t make it'

    return {
        "prompt": f"""The theme is {state.theme}. The characters have {dest} {state.destination} after facing several challenges. Here is a description of their last challenge: "{prev_outcome}".
The journey began with characters "{', '.join(state.original_characters)}"{end_characters}.
Their vehicle ended up as {state.vehicle}.
Provide a 60 word story description of the remaining characters {end_reason}. Respond with only a JSON object in the format {{"description":"..."}}""",
        "temperature": .7,
        "validation_schema": {"description": str}
    }


###Experimental new shop code

def get_custom_shops_prompt(theme: str) -> Prompt:
    return {
        "prompt": f"""This is a game with a custom theme of "{theme}". Your job is to generate 4 custom shops related to the theme that players can visit during their journey. The shops should offer unique and interesting services or items that interact with the game components: vehicle health, characters' traits and occupations, and items with tags. They should not involve any conflict. Keep the descriptions relatively short.
Reply in JSON in this format {{"shops":["Shop 1: ...", "Shop 2: ...", "Shop 3: ...", "Shop 4: ..."]}}. Be creative and make them engaging for the players.""",
        "temperature": .8,
        "validation_schema": {"shops": [str]}
    }

def get_custom_shop_scenario_prompt(theme: str, shop_situation: str, state: GameState) -> Prompt:
    return {
        "prompt": f"""This is a game with a custom theme of "{theme}". The players have encountered a shop with the following situation: "{shop_situation}". The state of the game before encountering the shop is items: "{', '.join(state.items)}"; characters: "{', '.join(state.characters)}"; and vehicle: {state.vehicle}. The players have 100 money to spend. Create a JSON object that includes the available items or services the shop offers, which may also involve adding or removing tags from characters and items, based on the services provided at the shop, the current game state, and the affordability of the services considering the theme. Additionally, provide a short situation description for the encounter.

The JSON object should have the following fields:
- "items": a map with keys for the item name, and values for the cost in the local currency (optional).
- "GainTag": a map with keys for the character or item names, and nested maps with keys for the tags to be added and values for the cost.
- "RemoveTag": a map with keys for the character or item names, and nested maps with keys for the tags to be removed and values for the cost.
- "situation_description": a 75-word third person present tense story description of the shop encounter.

Example (for a hot springs shop):
{{
    "items": {{}},
    "GainTag": {{"John": {{"Relaxed": 10}}, "Sarah": {{"Relaxed": 10}}}},
    "RemoveTag": {{"Jake": {{"Tired": 5}}}},
    "situation_description": "The group stumbles upon a natural hot springs nestled in the valley. The warm, soothing waters are a welcome respite after days of travel. The caretaker of the hot springs offers various services that might help the weary travelers. Intrigued, John, Sarah, and Jake decide to explore what the hot springs have to offer."
}}""",
        "temperature": 0.7,
        "validation_schema": {"items": {"*": int}, "GainTag": {"*": {"*": int}}, "RemoveTag": {"*": {"*": int}}, "situation_description": str}
    }
