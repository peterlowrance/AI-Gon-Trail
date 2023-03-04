from typing import Literal, TypedDict, Optional
import json

# Prompts are made up of a string and a optional data type for validation
class Prompt(TypedDict):
    prompt: str
    response_type: Literal['yaml'] | Literal['json']
    validation_schema: Optional[dict]

start_prompt_for_items_purchase: Prompt = {
    "prompt": """This is a game that is similar to "The Oregon Train" but with a custom theme. The custom theme is "space". Respond with a yaml object that shows the available items to purchase at the start of the game. The yaml should have a field 'items' which is a mapping with keys of the item and value of the cost. There should be 20 items. The items should be things that the group can use to overcome challenges. Their cost should be 1 to 20 for each item. The user will have a total of 100 to spend on them. Also generate a field wagon which is a string. Each item and the wagon can have optional modifiers for extraneous features, shown in parentheses with the item name, for example "(broken) gun", " or "(strong, steel) shovel". Make these fields match the custom theme. Add modifiers to only some of the values.
Example:
```
items:
  (cracked) shovel: 10
  (stale) rations: 3
wagon: (old) wooden wagon
```

Respond with only this yaml object in a code block""",
    "response_type": "yaml",
    "validation_schema": {"items": {"*": int}, "wagon": str}
}

def get_validate_action_prompt(scenario: str, items: list[str], characters: list[str], action: str) -> Prompt:
    return {
        "prompt": f"""Your job is to determine whether or not a payers action is valid and possible. If the player action involves an object not in the Scenario, Available items or Characters it is not valid.

Scenario: "{scenario}"
Available items: {json.dumps(items)}
Characters: {json.dumps(characters)}
Players action: "{action}"

Is this player action possible? Respond in the format {{"valid": boolean, "explanation": string}}""",
        "response_type": "json",
        "validation_schema": {"valid": bool, "explanation": str}
    }