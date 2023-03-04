import os
import openai
import json
import yaml
from api.prompts import Prompt


class AiClient:

	def __init__(self):
		openai.api_key = os.getenv("OPENAI_API_KEY")
		self.model = 'gpt-3.5-turbo'

	def __call__(self):
		return self

	def gen(self, msg: str, history: list[str] = []) -> str:
		# Create list of messages, starts with user, then assistant...
		messages = []
		for i, h_msg in enumerate(history):
			role = 'user' if i % 2 == 0 else 'assistant'
			messages.append({'role': role, 'content': h_msg})
		messages.append({'role': 'user', 'content': msg})

		completion = openai.ChatCompletion.create(
			model=self.model,
			messages=[
				{"role": "user", "content": msg}
			]
		)
		return completion.choices[0].message.to_dict()['content']

	def gen_dict(self, prompt: Prompt, history: list[str] = [], tries = 1) -> dict | None:
		"""
		Generate an AI response to the prompt
		based on the prompt, either json or yaml will be parsed
		history: optional history of messages
		tries: the number of tries to get correct formatting from the prompt
		"""
		while tries > 0:
			tries -= 1
			res = self.gen(prompt['prompt'], history)
			# Parse it into a Python dictionary
			try:
				if prompt['response_type'] == 'yaml':
					# Find the start and end index of the yaml code block
					start = res.find("```") + 3
					end = res.rfind("```")
					# Extract the yaml substring
					data_str = res[start:end]
					data_dict = yaml.safe_load(data_str)
				elif prompt['response_type'] == 'json':
					# Find the start and end index of the json object
					start = res.find("{")
					end = res.rfind("}") + 1
					# Extract the json substring
					data_str = res[start:end]
					data_dict = json.loads(data_str)
			except:
				print(f"Invalid {data_str} from response {res}")
				continue
			if 'validation_schema' in prompt:
				valid = validate(data_dict, prompt['validation_schema'])
				if not valid:
					print("Invalid response", data_dict)
					continue
			return data_dict
		return None

	
# Bing generated validation function
def validate(obj, schema) -> bool:
	# base case: if schema is a type, check if obj is of that type
	if isinstance(schema, type):
		return isinstance(obj, schema)
	# recursive case: if schema is a dict, check if obj is also a dict and validate each key-value pair
	elif isinstance(schema, dict):
		if not isinstance(obj, dict):
			return False
		for key in schema:
			# If key is *, validate all values with the schema's value
			if key == '*':
				if any(not validate(val, schema[key]) for val in obj.values()):
					return False
			# check if obj has the same key and validate its value
			elif key not in obj or not validate(obj[key], schema[key]):
				return False
		return True
	# recursive case: if schema is a list, check if obj is also a list and validate each element
	elif isinstance(schema, list):
		if not isinstance(obj, list):
			return False
		for elem in obj:
			# check if any element in schema can validate elem
			if not any(validate(elem, sub_schema) for sub_schema in schema):
				return False
		return True
	# invalid case: schema is not a type, dict or list
	else:
		raise ValueError("Invalid schema")
