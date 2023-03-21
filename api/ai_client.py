import os
import openai
import json
import yaml
from api.prompts import Prompt
import re

class AiClient:

	def __init__(self, key: str | None):
		if key == os.getenv("OVERRIDE_KEY"):
			openai.api_key = os.getenv("OPENAI_API_KEY")
		else:
			openai.api_key = key
		if not openai.api_key:
			raise Exception('No key provided')
		self.model = 'gpt-3.5-turbo'

	def __call__(self):
		return self

	def gen(self, msg: str, params: dict) -> str:
		completion = openai.ChatCompletion.create(
			model=self.model,
			temperature=params.get('temperature', 0.7),
			top_p=params.get('top_p', 1),
			# max_tokens=255,
			presence_penalty=params.get('presence_penalty', 0),
			frequency_penalty=params.get('frequency_penalty', 0),
			messages=[
				{"role": "user", "content": msg}
			]
		)
		# print(completion)
		return completion.choices[0].message.to_dict()['content']

	def gen_dict(self, prompt: Prompt, tries = 1) -> dict | None:
		"""
		Generate an AI response to the prompt
		based on the prompt, either json or yaml will be parsed
		tries: the number of tries to get correct formatting from the prompt
		"""
		while tries > 0:
			tries -= 1
			res = self.gen(prompt['prompt'], params={'temperature': prompt['temperature']})
			# Parse it into a Python dictionary
			data_str = ''
			data_dict = {}
			try:
				if prompt['response_type'] == 'yaml':
					data_dict = yaml.safe_load(res)
				elif prompt['response_type'] == 'json':
					# Find the start and end index of the json object
					start = res.find("{")
					end = res.rfind("}") + 1
					# Extract the json substring
					data_str = res[start:end]
					try:
						data_dict = json.loads(data_str)
					except:
						# If unable to parse, try to fix quotes
						data_str = fix_missing_quotes(data_str)
						data_dict = json.loads(data_str)
			except:
				print(f"Invalid {data_str} from response {res} with dict {data_dict}")
				continue
			if 'validation_schema' in prompt:
				valid = validate(data_dict, prompt['validation_schema'])
				if not valid:
					print("Invalid response", data_dict)
					continue
			return data_dict
		return None

# Thanks bing for this regex :)
def fix_missing_quotes(json_string):
    # Use a regular expression to find object keys without quotes
    fixed_json = re.sub(r'([{,])(\s*)([A-Za-z0-9_]+)(\s*):', r'\1"\3":', json_string)
    return fixed_json

	
# Bing generated validation function
def validate(obj, schema) -> bool:
	# base case: if schema is a type, check if obj is of that type
	if isinstance(schema, type):
		return isinstance(obj, schema)
	# recursive case: if schema is a dict, check if obj is also a dict and validate each key-value pair
	elif isinstance(schema, dict):
		if not isinstance(obj, dict):
			return False
		# Make sure they both have the same keys except for '*'
		if '*' not in schema and set(schema.keys()) != set(obj.keys()):
			return False
		for key in schema:
			# If key is *, validate all values with the schema's value
			if key == '*':
				if any(not validate(val, schema[key]) for val in obj.values()):
					return False
			# check if obj has the same key and validate its value
			elif not validate(obj[key], schema[key]):
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
