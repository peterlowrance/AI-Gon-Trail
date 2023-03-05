from django.test import TestCase
from api.ai_client import AiClient
from api.free_ai_client import FreeAiClient
from api.prompts import *

class PromptTestCase(TestCase):
    client: AiClient

    def setUp(self):
        # Set up data for the tests
        self.client = FreeAiClient()

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
