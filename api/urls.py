from django.urls import path

from . import views

urlpatterns = [
    path('test', views.test),
    path('game-start-items', views.get_game_start),
]