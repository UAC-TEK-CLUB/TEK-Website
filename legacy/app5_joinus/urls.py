from django.urls import path
from . import views
from .views import apply, submit_application
from django.views.generic import TemplateView


app_name = 'joinus'

urlpatterns = [
    path('apply/', views.apply, name='apply'),
    path('submit/', submit_application, name='submit'),
    path('contact/', views.contact, name='contact'),
    path('faq/', views.faq, name='faq')
]