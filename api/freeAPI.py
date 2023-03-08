import pyautogui
import pygetwindow as gw




def locationFinder():
    while True:
        x, y = pyautogui.position()
        print(x, y)
        pyautogui.sleep(3)

locationFinder()
# main()