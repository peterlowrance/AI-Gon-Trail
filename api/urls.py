from django.urls import path

from . import views

urlpatterns = [
    # localhost:8000/api/game-start-items
    path('game-start-items', views.get_game_start),
]