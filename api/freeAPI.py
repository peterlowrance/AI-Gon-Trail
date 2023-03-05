import webbrowser
import pyautogui
import pygetwindow as gw
import win32api
import pyperclip



def locationFinder():
    while True:
        x, y = pyautogui.position()
        print(x, y)
        pyautogui.sleep(3)

locationFinder()
# main()