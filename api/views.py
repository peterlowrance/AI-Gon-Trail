from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.prompts import *
from api.ai_client import AiClient
from uuid import uuid4

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
    client = AiClient()
    prompt = get_start_prompt(theme)
    res = client.gen_dict(prompt)
    # {"items": {"*": int}, "crew": [str], "wagon": str, "description": str}
    # res = {
    #     'items': {
    #         "shovel (sharp)": 15,
    #         "lumber (wet)": 7,
    #         "blanket (warm)": 10,
    #         "flint (sharp)": 3
    #     },
    #     'crew': ['Mary', 'Jack', 'Tom'],
    #     'description': 'You are heading west'
    # }

    # Save initial data to state
    database[session] = GameState(characters=res['crew'], items=[], vehicle=res['vehicle'])
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
    return Response()


@api_view(['POST'])
def take_action(request):
    """
    Take an action based on a scenario
    Modifies the items, characters, and vehicle of the state
    Returns the text of the outcome of this action
    """
    client = AiClient()
    session = request.data['session']
    state = database[session]
    scenario = request.data['scenario']
    action = request.data['action']
    # TODO: validate the user's input

    prompt = get_validate_action_prompt(scenario, state, action)
    res = client.gen_dict(prompt)
    valid = res['valid']
    valid_explanation = res['explanation']
    if not valid:
        return Response({'valid': False, 'text': valid_explanation})
    prompt = get_scenario_outcome_prompt(scenario, action, state)
    res = client.gen_dict(prompt)
    outcome = res['outcome']
    # TODO: also update the vehicle
    items = res['items']
    characters = res['characters']
    state.progress(items=items, characters=characters)
    return Response({'valid': True, 'text': outcome})


@api_view(['GET'])
def get_scenario(request):
    """
    Get the scenario based on the current state
    Also returns a list of suggested actions
    """
    session = request.GET['session']
    state = database[session]
    prompt = get_scenario_prompt(state)
    client = AiClient()
    res = client.gen_dict(prompt)
    scenario = res['scenario']
    summary = res['summary']
    suggestions = res['suggestions']
    state.previous_summaries.append(summary)
    return Response({'scenario': scenario, 'suggestions': suggestions})
