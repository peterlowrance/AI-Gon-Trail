from typing import Literal, TypedDict, Optional
import json

class Prompt(TypedDict):
    prompt: str
    temperature: float
    response_type: Literal['yaml'] | Literal['json']
    validation_schema: dict | None

def get_start_prompt(theme: str) -> Prompt:
    return {
        "prompt": f"""This is a game that is similar to "The Oregon Trail" but with a custom theme. The custom theme is "{theme}". Respond with a yaml object that shows the available items to purchase at the start of the game. The yaml should have a field 'items' which is a mapping with keys of the item and value of the cost. There should be 20 items. The items should be things that the group can use to overcome challenges. Their cost should be 1 to 20 for each item. The user will have a total of 100 to spend on them. Also generate a sequence of 5 characters that are in the crew. A field wagon which is a string. A field description which explains how the crew starts out on their journey based on the theme. Each item, character, and the wagon can have optional modifiers for extraneous features, shown in parentheses with the item name, for example "(broken) gun", " or "(strong, steel) shovel". Make these fields match the custom theme. Add modifiers to only some of the values.
Example:

items:
  (cracked) shovel: 10
  (stale) rations: 3
crew:
 - (cartographer) Bob
wagon: (old) wooden wagon
description: The group sets out...


Respond with only this yaml object""",
        "temperature": 0.7,
        "response_type": "yaml",
        "validation_schema": {"items": {"*": int}, "crew": [str], "wagon": str, "description": str}
    }

def get_validate_action_prompt(scenario: str, items: list[str], characters: list[str], action: str) -> Prompt:
    return {
        "prompt": f"""Your job is to determine whether or not a payers action is valid and humanly possible. If the player action involves an object not in the Scenario, Available items, or Characters it is not valid.

Scenario: "{scenario}"
Available items {json.dumps(items)}
Characters: {json.dumps(characters)}
Players action: "{action}"

Is this player action valid? Respond in the format {{"valid": true or false, "explanation": "..."}}""",
        "temperature": 0,
        "response_type": "json",
        "validation_schema": {"valid": bool, "explanation": str}
    }