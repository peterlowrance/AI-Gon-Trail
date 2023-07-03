from typing import Literal
import logging
import random

class GameState:
    characters: list[str]
    original_characters: list[str]
    items: list[str]
    group_base: str

    total_steps: int
    current_step: int
    situations: list[str]
    theme: str
    goal: str
    game_over: Literal['WIN', 'LOSE'] | None

    def __init__(self, characters: list[str], items: list[str], group_base: str, situations: list[str], theme: str, goal: str):
        self.total_steps = 8
        self.current_step = 1
        self.characters = characters
        self.original_characters = characters
        self.items = items
        self.situations = situations
        self.group_base = group_base
        self.theme = theme
        self.goal = goal
        self.game_over = None

    def progress(self, characters: list[str], items: list[str], group_base: str):
        self.characters = characters
        self.items = items
        self.group_base = group_base
        self.current_step += 1
        if len(characters) == 0:
            self.game_over = 'LOSE'
        elif ' 0/' in group_base or 'destroyed' in group_base.lower() or 'abandoned' in group_base.lower():
            self.game_over = 'LOSE'
        elif self.current_step > self.total_steps:
            self.game_over = 'WIN'
        if self.game_over:
            logging.info(self.game_over, self.characters, self.group_base, self.theme, self.goal)

    def get_difficulty(self) -> str:
        difficulties = ['easy', 'medium', 'hard', 'extremely hard']
        return random.choice(difficulties)

    def __str__(self):
        return f"Characters: {', '.join(self.characters)}\nItems: {', '.join(self.items)}\n{self.group_base}\nOn step {self.current_step}/{self.total_steps}"