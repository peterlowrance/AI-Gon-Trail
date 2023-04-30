from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.prompts import *
from api.ai_client import AiClient
from api.item_parser import ItemParser
from uuid import uuid4
from threading import Thread
import time
import logging

# Use local variable for database for now
database: dict[str, GameState] = {}


@api_view(['POST'])
def game_start_items(request):
    """
    Starts a game by creating a session, characters, and vehicle from a theme
    Returns a uuid for the session, items and their cost
    """
    session = uuid4().hex
    theme = request.GET.get('theme', 'Oregon Trail')
    theme = theme[:50]
    key = request.headers.get('openai_key')
    if not key:
        key = request.GET.get('key')
    client = AiClient(key)
    prompt = get_start_prompt(theme)
    res = client.gen_dict(prompt)
    destination = res['destination'].lower()

    # Save initial data to state
    database[session] = GameState(characters=res['characters'], items=[], vehicle=res['vehicle'], situations=[], theme=theme, destination=destination)
    logging.info(f'{theme} -> {destination}')

    # Get the scenario list in another thread so we can start the game quicker
    def initialize_scenario_list():
        scenario_prompt = get_scenario_list_prompt(theme, destination)
        scenario_res = client.gen_dict(scenario_prompt)
        database[session].situations = scenario_res['situations']
    Thread(target=initialize_scenario_list).start()

    return Response({'items': res['items'], 'session': session, 'description': res['description']})


@api_view(['GET'])
def get_game_status(request):
    session = request.GET.get('session')

    state = database[session]

    return Response({
        'vehicle': state.vehicle,
        'items': state.items,
        'characters': state.characters,
    })


@api_view(['POST'])
def choose_items(request):
    """
    Modify the items in the session's state
    """
    session = request.data['session']
    items = request.data['items']

    state = database[session]
    state.items = items
    # If the situations haven't been created by the thread yet, wait
    count = 0
    while len(state.situations) == 0:
        time.sleep(1)
        count += 1
        if count > 15:
            raise Exception("Failed to start the game, situations weren't generated")
    return Response()


@api_view(['POST'])
def take_action(request):
    """
    Take an action based on a scenario
    Modifies the items, characters, and vehicle of the state
    Returns the text of the outcome of this action
    """
    session = request.data['session']
    state = database[session]
    scenario = request.data['scenario']
    action = request.data['action']
    key = request.headers.get('openai_key')
    if not key:
        key = request.GET.get('key')
    client = AiClient(key)

    prompt = get_validate_action_prompt(scenario, state, action)
    res = client.gen_dict(prompt)
    valid = res['valid']
    valid_explanation = res['explanation']
    if not valid:
        return Response({'valid': False, 'text': valid_explanation})
    prompt = get_scenario_outcome_prompt(scenario, action, state)
    res = client.gen_dict(prompt)
    
    outcome = res['outcome']
    items = res['items']
    characters = res['characters']
    vehicle = res['vehicle']

    # Get old/previous parsers
    old_items_parser = ItemParser(state.items)
    old_character_parser = ItemParser(state.characters)
    # Validate item changes
    new_item_parser = ItemParser(items)
    added, removed, changed = old_items_parser.difference(new_item_parser)
    # Parse character changes
    new_character_parser = ItemParser(characters)
    character_added, character_removed, character_changed = old_character_parser.difference(new_character_parser)
    # Parse vehicle changes
    old_vehicle_parser = ItemParser([state.vehicle])
    new_vehicle_parser = ItemParser([vehicle])
    v_added, v_removed, v_changes = old_vehicle_parser.difference(new_vehicle_parser)
    if len(v_added) > 0 or len(v_removed) > 0:
        if not v_changes:
            v_changes = {vehicle: {'added': [], 'removed': []}}
        for key in v_changes:
            v_changes[key]['added'].extend(v_added)
            v_changes[key]['removed'].extend(v_removed)

    state.progress(items=items, characters=characters, vehicle=vehicle)

    return Response({
        'valid': True,
        'text': outcome,
        'game_over': state.game_over,
        # Return the changed items/characters so the frontend can render them with the story panel
        'item_changes': {
            'added': added,
            'removed': removed,
            'changed': changed
        },
        'character_changes': {
            'added': character_added,
            'removed': character_removed,
            'changed': character_changed,
        },
        'vehicle_changes': v_changes
    })


@api_view(['POST'])
def take_action_v2(request):
    """
    Take an action based on a scenario
    Modifies the items, characters, and vehicle of the state
    Returns the text of the outcome of this action
    """
    session = request.data['session']
    state = database[session]
    scenario = request.data['scenario']
    action = request.data['action']
    action = action[:200]
    key = request.headers.get('openai_key')
    if not key:
        key = request.GET.get('key')
    client = AiClient(key)

    # Do validation in background for performance
    def validate_thread(scenario, state, action):
        prompt = get_validate_action_prompt(scenario, state, action)
        res = client.gen_dict(prompt)
        global valid
        global valid_explanation
        valid = res['valid']
        valid_explanation = res['explanation']

    thread = Thread(target=validate_thread, args=(scenario, state, action), daemon=True)
    thread.start()
    
    
    prompt = get_scenario_outcome_prompt_v2(scenario, action, state)
    res = client.gen_dict(prompt)

    # Join validate thread and use it's result
    thread.join()
    if not valid:
        return Response({'valid': False, 'text': valid_explanation})

    items = []
    # Set items to all items in state.items that aren't in items_lost
    for i in state.items:
        # If item is being removed, make sure it doesn't get removed again
        if i in res['items_lost']:
            res['items_lost'].remove(i)
        # Handle case where removed item is like 'shovel' instead of 'shovel (damaged)'
        elif Item(i).key in res['items_lost']:
            res['items_lost'].remove(Item(i).key)
        else:
            items.append(i)
    # Change any items in items_changed
    for old, new in res['items_changed'].items():
        try:
            i = items.index(old)
            items[i] = new
        except:
            pass
    # Add any items gained
    for i in res['items_gained']:
        if i.lower() != 'none':
            items.append(i)

    characters = []
    # Set characters to be all characters from state.characters that aren't removed
    for c in state.characters:
        # If character is being removed, make sure it doesn't get removed again
        if c in res['characters_lost']:
            res['characters_lost'].remove(c)
        # Handle case where removed item is like 'shovel' instead of 'shovel (damaged)'
        elif Item(c).key in res['characters_lost']:
            res['characters_lost'].remove(Item(c).key)
        else:
            characters.append(c)
    # Change any characters in characters_changed
    for old, new in res['characters_changed'].items():
        try:
            i = characters.index(old)
            characters[i] = new
        except:
            pass
    # Add gained characters
    for c in res['characters_gained']:
        if c.lower() != 'none':
            characters.append(c)
    
    # V2
    outcome = res['outcome']
    vehicle = res['vehicle']

    # Get old/previous parsers
    old_items_parser = ItemParser(state.items)
    old_character_parser = ItemParser(state.characters)
    # Validate item changes
    new_item_parser = ItemParser(items)
    added, removed, changed = old_items_parser.difference(new_item_parser)
    # Parse character changes
    new_character_parser = ItemParser(characters)
    character_added, character_removed, character_changed = old_character_parser.difference(new_character_parser)
    # Parse vehicle changes
    old_vehicle_parser = ItemParser([state.vehicle])
    new_vehicle_parser = ItemParser([vehicle])
    v_added, v_removed, v_changes = old_vehicle_parser.difference(new_vehicle_parser)
    if len(v_added) > 0 or len(v_removed) > 0:
        if not v_changes:
            v_changes = {vehicle: {'added': [], 'removed': []}}
        for key in v_changes:
            v_changes[key]['added'].extend(v_added)
            v_changes[key]['removed'].extend(v_removed)

    state.progress(items=items, characters=characters, vehicle=vehicle)

    return Response({
        'valid': True,
        'text': outcome,
        'game_over': state.game_over,
        # Return the changed items/characters so the frontend can render them with the story panel
        'item_changes': {
            'added': res['items_gained'],
            'removed': removed,
            'changed': changed
        },
        'character_changes': {
            'added': res['characters_gained'],
            'removed': character_removed,
            'changed': character_changed,
        },
        'vehicle_changes': v_changes,
        'quote': res['quote']
    })

@api_view(['GET'])
def get_scenario(request):
    """
    Get the scenario based on the current state
    Also returns a list of suggested actions
    """
    session = request.GET['session']
    key = request.headers.get('openai_key')
    if not key:
        key = request.GET.get('key')
    state = database[session]
    prompt = get_scenario_prompt(state)
    client = AiClient(key)
    res = client.gen_dict(prompt)
    scenario = res['situation']
    suggestions = res['suggestions']
    return Response({'scenario': scenario, 'suggestions': suggestions})


@api_view(['GET'])
def get_game_end(request):
    """
    Get a descripiton of the game ending
    """
    session = request.GET['session']
    key = request.headers.get('openai_key')
    if not key:
        key = request.GET.get('key')
    prev_outcome = request.GET['prev_outcome']
    state = database[session]
    prompt = get_game_end_prompt(prev_outcome, state)
    client = AiClient(key)
    res = client.gen_dict(prompt)
    description = res['description']
    return Response(description)