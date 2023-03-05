from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.prompts import *
from api.ai_client import AiClient


@api_view(['GET'])
def get_game_start(request):
    theme = request.GET.get('theme', 'Oregon Trail')
    client = AiClient()
    prompt = get_start_prompt(theme)
    res = client.gen_dict(prompt)
    return Response(res)


@api_view(['POST'])
def start_game(request):
    pass
    # TODO: save wagon, inventory, initial description, theme? to database