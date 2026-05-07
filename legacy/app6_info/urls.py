from django.urls import path
from . import views

app_name = 'info'

urlpatterns = [
    path('regulation/', views.regulation, name='regulation'),
]