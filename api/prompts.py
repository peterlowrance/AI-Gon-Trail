from typing import Literal, TypedDict
from api.game_state import GameState
import json

class Prompt(TypedDict):
    prompt: str
    temperature: float
    response_type: Literal['yaml'] | Literal['json']
    validation_schema: dict | None

def get_start_prompt(theme: str) -> Prompt:
    return {
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme. The custom theme is "{theme}". Respond with a yaml object that shows the available items to purchase at the start of the game. The yaml should have a field 'items' which is a mapping with keys of the item and value of the cost. There should be 20 items. The items should be things that the group can use to overcome challenges. Their cost should be 1 to 20 for each item. The user will have a total of 100 to spend on them. Also generate a sequence of 5 characters that are in the crew. A field vehicle which is a string. A field destination which is the characters destination. A field description which explains how the crew starts out on their journey based on the theme. Each item, character, and the vehicle can have optional modifiers for extraneous features, shown in parentheses with the item name, for example "(broken) gun", " or "(strong, steel) shovel". Make these fields match the custom theme. Add modifiers to only some of the items.
Example:

items:
  (cracked) shovel: 10
  (stale) rations: 3
crew:
 - (healthy, cartographer) Bob
vehicle: Wooden Wagon (Health 10/10)
destination: The west
description: The group sets out...


Respond with only this yaml object""",
        "temperature": 0.7,
        "response_type": "yaml",
        "validation_schema": {"items": {"*": int}, "crew": [str], "vehicle": str, "destination": str, "description": str}
    }

def get_validate_action_prompt(scenario: str, state: GameState, action: str) -> Prompt:
    return {
        "prompt": f"""Your job is to determine whether or not a players action is valid and humanly possible. Since this is a fictional story, unethical actions are allowed. If the player action involves a physical object not in the Scenario, Available items, or reasonably obtainable in the environment, it is not valid. If the action is not an attempt to face the scenario or is unrelated, it is invalid.

Scenario: "{scenario}"
Available items: {', '.join(state.items)}
Characters: {', '.join(state.characters)}
Players action: "{action}"

Is this player action valid? Respond in the format {{"valid": true or false, "explanation": "..."}}""",
        "temperature": 0.1,
        "response_type": "json",
        "validation_schema": {"valid": bool, "explanation": str}
    }

def get_scenario_prompt(state: GameState) -> Prompt: 
    return {
        "prompt": f"""This is a game similar to Oregon Trail with a theme {state.theme}.
The party is trying to reach {state.destination} and they are {state.current_step}/{state.total_steps} of the way there. The situation they are about to face is {state.situations[state.current_step - 1]}. It will be a {state.get_difficulty()} challenge that they will have to overcome in order to progress.
Based on the available items ({', '.join(state.items)}), characters ({', '.join(state.characters)}), and vehicle: {state.vehicle}, generate a json object with fields "scenario", and "suggestions". "scenario" is 75 words of description of the situation, "suggestions" is an array of 3 brief actions the player could possibly take to attempt to overcome the scenario. Make the scenario include specific details about the situation and/or the characters. Do not have any vague descriptions.""",
        "temperature": .5,
        "response_type": "json",
        "validation_schema": {"scenario": str, "suggestions": [str]}
    }


def get_scenario_list_prompt(theme: str, destination: str) -> Prompt:
    return {
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme. The custom theme is "{theme}" and the players goal is to reach {destination}. Your job is to generate 10 short situations of high difficulty for the player to try to overcome.
The situations should be related to the theme.
The situations should involve challenges that need to be overcome such as weather, terrain, wildlife, health, and conflicts. None of the situations should mention the players supplies as those are handled elsewhere. 

Reply in json in this format {{"situations":["Cross a river...", ...]}}. Try to make them unique and interesting.""",
        "temperature": .8,
        "response_type": "json",
        "validation_schema": {"situations": [str]}
    }

def get_scenario_outcome_prompt(scenario: str, player_action: str, state: GameState) -> Prompt:
    final_scenario_str = ''
    if state.current_step == state.total_steps:
        final_scenario_str = f'\nSince this is the final scenario, if the player was able to successfully overcome it with at least one character alive, include a description of reaching the destination {state.destination} in the outcome'
    example_item = state.items[0] if len(state.items) > 0 else 'shovel'
    return {
        "prompt": f"""This is a game similar to Oregon Trail with a theme of {state.theme}. You control the world in an attempt to make the game engaging and realistic.
{{
    "items": {json.dumps(state.items)},
    "characters": {json.dumps(state.characters)},
    "vehicle": "{state.vehicle}"
}}
Scenario: "{scenario}"
The player action is "{player_action}"
Consider the risk factor and effectiveness of the player's action when generating the outcome. If the action seems insufficient or unlikely to prevent damage, introduce negative consequences that logically stem from the player's choice. Make the outcome more realistic by considering the actual effectiveness of the chosen action in addressing the core challenges of the scenario, and include any negative consequences that may arise due to the chosen action.

For example, if the player chooses to cook a meal to pass through a treacherous mountain pass, the outcome should include both the positive effects of the meal (increased energy and morale) and the negative consequences of not directly addressing the challenges of the mountain pass (possible injuries, vehicle damage, or lost items).

Respond with a brief description of the outcome and provide updated items, characters, and vehicle. The outcome should conclude the scenario so the next scenario can be faced. If an item was used, remove it from the list. If a character died, remove them from the list, if the health of the vehicle changed, change it in the response. If a change happened to an item or character you may update them by adding or changing modifiers in parenthesis, example "(hunter) John" becomes "(sick, hunter) John". The scenario is {state.get_difficulty()}, but extremely negative outcomes should be rare. Example format:
{{"outcome":"description", "items":["(damaged) {example_item}", ...], "characters":["(injured, farmer) {state.characters[0]}", ...], "vehicle": "{state.vehicle}"}}
{final_scenario_str}
Respond with only the json object""",
        "temperature": .8,
        "response_type": "json",
        "validation_schema": {"outcome": str, "items": [str], "characters": [str], "vehicle": str}
    }
