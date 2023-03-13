

class GameState:
    characters: list[str]
    items: list[str]
    vehicle: str

    total_steps: int
    current_step: int

    previous_summaries: list[str]

    def __init__(self, characters: list[str], items: list[str], vehicle: str):
        self.total_steps = 10
        self.current_step = 1
        self.characters = characters
        self.items = items
        self.previous_summaries = []
        self.vehicle = vehicle

    def progress(self, characters: list[str], items: list[str], vehicle: str, summary: str):
        self.characters = characters
        self.items = items
        self.vehicle = vehicle
        self.previous_summaries.append(summary)
        self.current_step += 1
        # TODO: consider limiting the max size of previous_summaries

    def __str__(self):
        return f"Characters: {', '.join(self.characters)}\nItems: {', '.join(self.items)}\n{self.vehicle}\nOn step {self.current_step}/{self.total_steps}"