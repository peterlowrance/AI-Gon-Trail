from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.prompts import *
from api.ai_client import AiClient

@api_view(['GET'])
def test(request):
    # Use session for messages?
    return Response([])


@api_view(['GET'])
def get_game_start(request):
    client = AiClient()
    res = client.gen_yaml(start_prompt_for_items_purchase)
    return Response(res)


@api_view(['POST'])
def start_game(request):
    pass
    # TODO: save wagon, inventory, initial description, theme? to database