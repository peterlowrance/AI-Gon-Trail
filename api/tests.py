from django.test import TestCase
from api.ai_client import AiClient
from api.prompts import *
from api.game_state import GameState
import random 

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
        for i in range(1):
            with open("trial/"+str(i), mode="w+") as f:
                try:
                    state = GameState(characters=random.choice(charactersSets), items=random.choice(itemSets), vehicle=random.choice(vehicleOptions))
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
                        state.progress(characters, items, vehicle, summary)
                        print('Outcome:', outcome, file=f)
                        print('State: [', file=f)
                        print(state, file=f)
                        print(']\n', file=f)
                except Exception as e:
                    print(f"Exception: {type(e).__name__}\nException message: {e}", file=f)
