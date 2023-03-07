from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.prompts import *
from api.ai_client import AiClient


@api_view(['GET'])
def get_game_start(request):
    return Response({"items": {
        "shovel": 15,
        "lumber": 7,
        "blanket": 10,
        "flint": 3
    }, "crew": ["Bob"], "wagon": "wagon", "description": "desc"})
    theme = request.GET.get('theme', 'Oregon Trail')
    client = AiClient()
    prompt = get_start_prompt(theme)
    res = client.gen_dict(prompt)
    # {"items": {"*": int}, "crew": [str], "wagon": str, "description": str}

    return Response(res)


@api_view(['POST'])
def start_game(request):
    pass
    # TODO: save wagon, inventory, initial description, theme? to database