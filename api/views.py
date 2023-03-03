from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def test(request):
    # Use session for messages?
    return Response([])


@api_view(['GET'])
def get_game_start(request):
    # TODO: game start ai
    items = []
    wagon = ''
    return Response({'items': items, 'wagon': wagon})


@api_view(['POST'])
def start_game(request):
    # TODO: save wagon, inventory, initial description, theme? to database
    return Response()