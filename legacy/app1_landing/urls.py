from django.urls import path
from . import views

app_name = 'landing'

urlpatterns = [
    path('', views.landing, name='landing'),
    path('landing/', views.landing, name='landing')
]