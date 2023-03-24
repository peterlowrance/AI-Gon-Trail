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
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme. The custom theme is "{theme}". Respond with a yaml object that shows the available items to purchase at the start of the game. The yaml should have a field 'items' which is a mapping with keys of the item and value of the cost. There should be 20 items. The items should be things that the group can use to overcome challenges. Their cost should be 1 to 20 for each item. The user will have a total of 100 to spend on them. Also generate a sequence of 5 characters that are in the crew. A field vehicle which is a string. A field description which explains how the crew starts out on their journey based on the theme. Each item, character, and the vehicle can have optional modifiers for extraneous features, shown in parentheses with the item name, for example "(broken) gun", " or "(strong, steel) shovel". Make these fields match the custom theme. Add modifiers to only some of the values.
Example:

items:
  (cracked) shovel: 10
  (stale) rations: 3
crew:
 - (cartographer) Bob
vehicle: wooden wagon (Health: 10/10)
description: The group sets out...


Respond with only this yaml object""",
        "temperature": 0.7,
        "response_type": "yaml",
        "validation_schema": {"items": {"*": int}, "crew": [str], "vehicle": str, "description": str}
    }

def get_validate_action_prompt(scenario: str, state: GameState, action: str) -> Prompt:
    return {
        "prompt": f"""Your job is to determine whether or not a payers action is valid and humanly possible. Since this is a fictional story, unethical actions are allowed. If the player action involves a physical object not in the Scenario, Available items, or Characters, or reasonably obtainable in the environment, it is not valid. If the action is not an attempt to face the scenario or is unrelated, it is invalid.

Scenario: "{scenario}"
Available items {json.dumps(state.items)}
Characters: {json.dumps(state.characters)}
Players action: "{action}"

Is this player action valid? Respond in the format {{"valid": true or false, "explanation": "..."}}""",
        "temperature": 0,
        "response_type": "json",
        "validation_schema": {"valid": bool, "explanation": str}
    }

def get_scenario_prompt(state: GameState) -> Prompt: 
    return {
        "prompt": f"""This is a game similar to Oregon Trail. You control the NPC's and world in an attempt to make the game realistic.
The current status of the game is:
Vehicle: {state.vehicle}
Characters: {', '.join(state.characters)}
Items: {', '.join(state.items)}

The party is trying to reach the west and they are {state.current_step}/{state.total_steps} of the way there. The situation they are about to face is {state.situations[state.current_step - 1]}. It will be a challenge that they will have to overcome in order to progress. Make the situation difficulty harder the closer the player is to the end. Respond with a json object with fields scenario, and suggestions. scenario is 75 words of description. Suggestions is an array of 3 actions the player could possibly take to attempt to overcome the scenario.""",
        "temperature": .7,
        "response_type": "json",
        "validation_schema": {"scenario": str, "suggestions": [str]}
    }


def get_scenario_list_prompt() -> Prompt:
    return {
        "prompt": """Your job is to generate 10 short situations of increasing difficulty for the player to try to overcome in an Oregon Trail game.
The situations should be related to the theme of traveling across the American frontier in the 19th century.
The situations should involve challenges that need to be overcome such as weather, terrain, wildlife, health, resources, and conflicts.

Reply in json in this format {"situations":["Cross a river...", ...]}. Try to make them unique and interesting.""",
        "temperature": .7,
        "response_type": "json",
        "validation_schema": {"situations": [str]}
    }

def get_scenario_outcome_prompt(scenario: str,  player_action: str, state: GameState) -> Prompt:
    example_item = state.items[0] if len(state.items) > 0 else 'shovel'
    return {
        "prompt": f"""This is a game similar to Oregon Trail. You control the NPC's and world in an attempt to make the game engaging and realistic.
Scenario: "{scenario}"
Available items {json.dumps(state.items)}
Characters: {json.dumps(state.characters)}
Vehicle: {json.dumps(state.vehicle)}
The player action is "{player_action}"

Respond with a brief description of the outcome and provide updated items, players, and vehicle. The outcome should conclude the scenario so the next scenario can be faced. If an item was used, remove it from the list. If a character died, remove them from the list. If a change happened to an item or character you may update them by adding or changing modifiers in parenthesis. If it is a bad outcome damage the vehicle health a bit. Extremely negative outcomes should be rare. Example format:
{{"outcome":"description", "items":["(damaged) {example_item}", ...], "characters":["(injured) {state.characters[0]}", ...]}}

Respond with only the json object""",
        "temperature": .7,
        "response_type": "json",
        "validation_schema": {"outcome": str, "items": [str], "characters": [str], "vehicle": str}
    }
