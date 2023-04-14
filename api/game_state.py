from typing import Literal
import logging
import random

class GameState:
    characters: list[str]
    original_characters: list[str]
    items: list[str]
    vehicle: str

    total_steps: int
    current_step: int
    situations: list[str]
    theme: str
    destination: str
    game_over: Literal['WIN', 'LOSE'] | None

    def __init__(self, characters: list[str], items: list[str], vehicle: str, situations: list[str], theme: str, destination: str):
        self.total_steps = 10
        self.current_step = 1
        self.characters = characters
        self.original_characters = characters
        self.items = items
        self.situations = situations
        self.vehicle = vehicle
        self.theme = theme
        self.destination = destination
        self.game_over = None

    def progress(self, characters: list[str], items: list[str], vehicle: str):
        self.characters = characters
        self.items = items
        self.vehicle = vehicle
        self.current_step += 1
        if len(characters) == 0:
            self.game_over = 'LOSE'
        elif ' 0/' in vehicle or 'destroyed' in vehicle.lower() or 'abandoned' in vehicle.lower():
            self.game_over = 'LOSE'
        elif self.current_step > self.total_steps:
            self.game_over = 'WIN'
        if self.game_over:
            logging.info(self.game_over, self.characters, self.vehicle, self.theme, self.destination)

    def get_difficulty(self) -> str:
        difficulties = ['easy', 'medium', 'hard', 'extremely hard']
        return random.choice(difficulties)

    def __str__(self):
        return f"Characters: {', '.join(self.characters)}\nItems: {', '.join(self.items)}\n{self.vehicle}\nOn step {self.current_step}/{self.total_steps}"