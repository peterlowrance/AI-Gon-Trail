
class GameState:
    characters: list[str]
    items: list[str]
    vehicle: str

    total_steps: int
    current_step: int
    situations: list[str]
    theme: str
    destination: str

    def __init__(self, characters: list[str], items: list[str], vehicle: str, situations: list[str], theme: str, destination: str):
        self.total_steps = 10
        self.current_step = 1
        self.characters = characters
        self.items = items
        self.situations = situations
        self.vehicle = vehicle
        self.theme = theme
        self.destination = destination

    def progress(self, characters: list[str], items: list[str], vehicle: str):
        self.characters = characters
        self.items = items
        self.vehicle = vehicle
        self.current_step += 1

    def get_difficulty(self) -> str:
        difficulties = ['easy', 'medium', 'hard', 'extremely hard']
        percent = self.current_step / self.total_steps
        diff_index = round(percent * (len(difficulties) - 1))
        return difficulties[diff_index]

    def __str__(self):
        return f"Characters: {', '.join(self.characters)}\nItems: {', '.join(self.items)}\n{self.vehicle}\nOn step {self.current_step}/{self.total_steps}"