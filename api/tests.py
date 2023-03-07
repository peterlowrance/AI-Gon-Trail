from django.test import TestCase
from api.ai_client import AiClient
from api.prompts import *
from api.game_state import GameState

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
            "deconstruct the wagon to build a bridge"
        ]
        invalid_actions = [
            "fly across",
            "cross a bridge"
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
        state = GameState(characters=['Bob', 'Sally', 'Frank'], items=['Wagon', 'Warm Blanket', 'Hiking Boots'])
        prompt = get_scenario_prompt(state)
        res = self.client.gen_dict(prompt)
        try:
            scenario = res['scenario']
            summary = res['summary']
            suggestions = res['suggestions']
        except:
            print('Error parsing!!!', res)
        print('Scenario:', scenario)
        print('Summary:', summary)
        print('Suggestions:', suggestions)

        player_action = 'Ford the river and cross'
        print('Player action', player_action)

        prompt = get_scenario_outcome_prompt(summary, player_action, state)
        res = self.client.gen_dict(prompt)
        try:
            outcome = res['outcome']
            items = res['items']
            characters = res['characters']
        except:
            print('Parsing error!!!', res)
        state.progress(characters, items, summary)
        print('Now')
        print('Outcome:', outcome)
        print(state)

        # Scenario 2!
        prompt = get_scenario_prompt(state)
        res = self.client.gen_dict(prompt)
        try:
            scenario = res['scenario']
            summary = res['summary']
            suggestions = res['suggestions']
        except:
            print('Error parsing!!!', res)
        print('Scenario:', scenario)
        print('Summary:', summary)
        print('Suggestions:', suggestions)

        player_action = suggestions[0]
        print('Player action', player_action)

        prompt = get_scenario_outcome_prompt(summary, player_action, state)
        res = self.client.gen_dict(prompt)
        try:
            outcome = res['outcome']
            items = res['items']
            characters = res['characters']
        except:
            print('Parsing error!!!', res)
        state.progress(characters, items, summary)
        print('Now')
        print('Outcome:', outcome)
        print(state)
