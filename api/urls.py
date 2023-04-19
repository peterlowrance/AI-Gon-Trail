from django.urls import path

from . import views

urlpatterns = [
    # localhost:8000/api/game-start-items
    path('game-start-items', views.game_start_items),
    path('choose-items', views.choose_items),
    path('game-status', views.get_game_status),
    path('game-scenario', views.get_scenario),
    path('take-action', views.take_action),
    path('take-action-v2', views.take_action_v2),
    path('game-end', views.get_game_end)
]