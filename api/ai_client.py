import os
import openai

class AiClient:

    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.model = 'gpt-3.5-turbo'

    def __call__(self):
        return self

    def gen(self, msg: str, history: list[str] = []):
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
        return completion.choices[0].message