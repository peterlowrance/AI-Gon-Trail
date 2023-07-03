from django.test import TestCase
from api.ai_client import AiClient
from api.prompts import *
from api.game_state import GameState
import random 
import re

class PromptTestCase(TestCase):
    client: AiClient

    def setUp(self):
        # Set up data for the tests
        self.client = AiClient()

    def test_validate_action_prompt(self):
        scenario = 'the party encounters a river that blocks their path'
        items = '["Wagon", "Warm Blanket", "Hiking Boots"]'
        characters = '["Bob", "Sally", "Frank"]'
        valid_actions = [
            "ford the river",
            "swim across",
            "look around for anyone that can help", 
            "get more information", 
        ]
        invalid_actions = [
            "fly across",
            "cross a bridge",
            "ride a train",
            "deconstruct the wagon to build a bridge",
            "buy a ferry ticket",
            "caulk wagon and float it across", 
        ]
        for a in valid_actions:
            prompt = get_validate_action_prompt(scenario, items, characters, a)
            res = self.client.gen_dict(prompt)
            self.assertTrue(res['valid'], f'Invalid response {res}')
        for a in invalid_actions:
            prompt = get_validate_action_prompt(scenario, items, characters, a)
            res = self.client.gen_dict(prompt)
            self.assertFalse(res['valid'], f'Invalid response {res}')

    def test_get_scenario_list(self):
        prompt = get_scenario_list_prompt("Oregon Trail")
        prompts = self.client.gen_dict(prompt)
        self.assertFalse(prompts == None, "Failed to generate scenario list")

# Run with:
# python manage.py test api.tests.PromptTestCase.test_idealistic_scenario
    def test_idealistic_scenario(self):
        # Set up the scenario
        scenario = "The party is faced with a treacherous mountain pass that winds through steep cliffs and narrow paths. Sarah's experience may come in handy as they navigate through the dangerous terrain. Alex's keen observation skills could help spot any potential danger ahead. John's toughness will be tested as he helps carry the heavy wagon through the rocky terrain. Maria's cooking skills could be put to use to keep the party's morale up during this challenging journey. James' mechanical knowledge may be useful in repairing any damages to the wagon. With limited resources, the party must strategize their next move."

        # Set up the game state
        state = GameState(
            characters=["(experienced) Sarah", "(observant) Alex", "(tough) John", "(cook) Maria", "(mechanic) James"],
            items=["Warm Blanket", "Hiking Boots", "Wagon"],
            group_base="Wagon: health is 100 out of 100",
            situations=[scenario]
        )

        # Set up the player action
        player_action = "Have Maria cook a hearty meal to boost the party's energy and morale before embarking on the journey."

        # Run the get_scenario_outcome_prompt function
        prompt = get_scenario_outcome_prompt(scenario, player_action, state)
        res = self.client.gen_dict(prompt)

        # Extract the outcome, items, characters, and vehicle from the response
        outcome = res['outcome']
        items = res['items']
        characters = res['characters']
        vehicle = res['vehicle']

        print(outcome)

        # Check if the outcome contains any negative consequences
        negative_outcome = re.search(r'(damage|injure|injury|loss|negative|problem|issue|difficulty|hardship|adversity|complication)', outcome, re.IGNORECASE)

        # Assert that the outcome has negative consequences
        self.assertTrue(negative_outcome, f"The outcome '{outcome}' does not contain any negative consequences")

# Run with:
# python manage.py test api.tests.PromptTestCase.test_unethical_action
    def test_unethical_action(self):
        # Set up the scenario
        scenario = "As the party continues their journey, one of their members, Emily, falls ill with a deadly disease. Her condition is worsening rapidly and she needs medicine urgently. The party is in the middle of a dense forest and they have no idea where the nearest town or hospital is. John suggests hunting for wild herbs that might help cure Emily. Sarah recommends splitting up to cover more ground and search for any signs of civilization. James suggests using his knowledge of herbs to create a makeshift medicine from the items they have."

        # Set up the game state
        state = GameState(
            characters=["Emily", "John", "Sarah", "James"],
            items=["Ax"],
            group_base=None,
            situations=[scenario]
        )

        # Set up the player action
        player_action = "Kill Emily with the Ax to prevent any further suffering."

        # Run the get_validate_action_prompt function
        prompt = get_validate_action_prompt(scenario, state, player_action)
        res = self.client.gen_dict(prompt)

        # Extract the valid and explanation from the response
        valid = res['valid']
        explanation = res['explanation']

        print(explanation)

        # Assert that the action is considered valid
        self.assertTrue(valid, f"The action '{player_action}' should be considered valid but was marked as invalid with explanation '{explanation}'")


# Run with:
# python manage.py test api.tests.PromptTestCase.test_scenario
    def test_scenario(self):      
        itemSet1 = ["Axe", "Bacon", "Beads", "Books", "Coffee", "Fishing Rod", "Flour", "Hiking Boots", "Laudanum", "Money", "Musical Instrument", "Oxen", "Peppermint", "Pickaxe", "Quinine", "Rope", "Shovel", "Snakebite Kit", "Spare Wheel", "Tobacco", "Warm Blanket", "Water Keg"]
        itemSet2 = ["Alcohol", "Blanket", "Bullets", "Candles", "Cheese", "Clothing", "Compass", "Dried Fruit", "Gunpowder", "Hammer", "Knife", "Matches", "Medicine Chest", "Pots and Pans", "Rifle", "Salt", "Soap", "Sugar", "Tea", "Tent", "Whiskey Flask", "Wool Coat"]
        itemSet3 = ["Biscuits", "Boots", "Butter", "Candy", "Coffee Pot", "Dress", "Fiddle", "Flintlock Pistol", "Glasses", "Hat", "Jacket", "Lantern", "Map", "Needle and Thread", "Pocket Watch", "Quilt", "Saw", "Skillet", "Spices", "Telescope", "Vinegar", "Wagon Cover"]
        itemSets = [itemSet1, itemSet2, itemSet3]
        characters1 = ['Lena', 'Ricardo', 'Mira', 'Jesse', 'Kai']
        characters2 = ['Nora', 'Leo', 'Eva', 'Oscar', 'Zoe']
        characters3 = ['Mila', 'Eli', 'Lila', 'Max', 'Ruby']
        charactersSets = [characters1, characters2, characters3]
        vehicleOptions = ["Wagon: health is 100 out of 100", "Wagon: Good condition", "Wagon: health 100/100", "Wagon: full health"]
        scenario_list_prompt = get_scenario_list_prompt("Oregon Trail")
        scenario_list = self.client.gen_dict(scenario_list_prompt)["situations"]
        for i in range(1):
            with open("trial/"+str(i), mode="w+") as f:
                try:
                    state = GameState(characters=random.choice(charactersSets), items=random.choice(itemSets), group_base=random.choice(vehicleOptions), situations=scenario_list)
                    print(f"Running with {state}", file=f)
                    while state.current_step <= state.total_steps and len(state.characters) > 0:
                        print(f'\nScenario {state.current_step}', file=f)
                        prompt = get_scenario_prompt(state)
                        res = self.client.gen_dict(prompt)
                        try:
                            scenario = res['scenario']
                            summary = res['summary']
                            suggestions = res['suggestions']
                        except:
                            print('Error parsing!!!', res, file=f)
                            break
                        print('Scenario:   ', scenario, file=f)
                        print('Summary:    ', summary, file=f)
                        print('Suggestions:', suggestions, file=f)

                        player_action = suggestions[0]
                        print('Player action', player_action, file=f)

                        prompt = get_scenario_outcome_prompt(summary, player_action, state)
                        res = self.client.gen_dict(prompt)
                        try:
                            outcome = res['outcome']
                            items = res['items']
                            characters = res['characters']
                            #TODO parametrize this for space
                            vehicle = res['vehicle']
                        except:
                            print('Parsing error!!!', res, file=f)
                            break
                        state.progress(characters, items, vehicle)
                        print('Outcome:', outcome, file=f)
                        print('State: [', file=f)
                        print(state, file=f)
                        print(']\n', file=f)
                except Exception as e:
                    print(f"Exception: {type(e).__name__}\nException message: {e}", file=f)



