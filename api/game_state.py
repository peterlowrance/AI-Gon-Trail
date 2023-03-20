

class GameState:
    characters: list[str]
    items: list[str]
    vehicle: str

    total_steps: int
    current_step: int
    situations: list[str]
    def __init__(self, characters: list[str], items: list[str], vehicle: str, situations: list[str]):


        self.total_steps = 10
        self.current_step = 1
        self.characters = characters
        self.items = items
        self.situations = situations
        self.vehicle = vehicle

    def progress(self, characters: list[str], items: list[str], vehicle: str):
        self.characters = characters
        self.items = items
        self.vehicle = vehicle
        self.current_step += 1
        if self.current_step > self.total_steps:
            raise Exception('You have finished the game')

    def __str__(self):
        return f"Characters: {', '.join(self.characters)}\nItems: {', '.join(self.items)}\n{self.vehicle}\nOn step {self.current_step}/{self.total_steps}"