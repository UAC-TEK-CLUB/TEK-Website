from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def lab1(request): 
    return render(request, 'lab1.html')


def lab2(request): 
    return render(request, 'lab2.html')


def lab3(request): 
    return render(request, 'lab3.html')


def lab4(request): 
    return render(request, 'lab4.html')
