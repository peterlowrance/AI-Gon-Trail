import os
import openai
import json
import yaml
from api.prompts import Prompt
from api.ai_client import AiClient
import webbrowser
import pyautogui
import pygetwindow as gw
import win32api
import pyperclip
from bs4 import BeautifulSoup


class FreeAiClient(AiClient):

    def __init__(self):
        pass

    #This ignores params, it's the default for the playground...
    def gen(self, msg: str, params: dict) -> str:
        url = "https://platform.openai.com/playground?mode=chat"
        webbrowser.open_new_tab(url)
        pyautogui.sleep(1)

        pyautogui.click(755, 298)

        # Wait for the page to load
        # pyautogui.sleep(1)

        pyautogui.typewrite(msg)
        
        pyautogui.click(385, 1411)

        pyautogui.press("enter")
        



        pyautogui.press("f12")

        pyautogui.sleep(3)

        pyautogui.click(56, 824)
        pyautogui.sleep(3)

        pyautogui.click(293, 909)
        pyautogui.sleep(15)

        pyautogui.typewrite("/html/body/div[1]/div[1]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div/div[2]/div[2]/textarea")

        pyautogui.press("enter")

        pyautogui.sleep(10)


        pyautogui.click(293, 1105)
        pyautogui.sleep(1)
        pyautogui.hotkey('ctrl', 'c')
        pyautogui.sleep(1)
        html_result = pyperclip.paste()
        print(html_result)
        pyautogui.hotkey('ctrl', 'w')
        soup = BeautifulSoup(html_result, 'html.parser')
        result = soup.textarea.string
        print(result)
        return result
