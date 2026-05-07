from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def landing(request):
    return render(request, 'landing.html')          

def modal(request):
    return render(request, 'modal.html')          