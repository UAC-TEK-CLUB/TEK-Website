from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from .models import Application

def contact(request):
    return render(request, 'contact.html')

def faq(request):
    return render(request, 'faq.html')

@login_required(login_url='account:signin')
def apply(request):
    return render(request, 'apply.html')

@login_required(login_url='account:signin')
@require_POST
def submit_application(request):
    labpreference = (request.POST.get('labpreference') or '').strip()
    motivation = (request.POST.get('motivation') or '').strip()

    if not labpreference:
        messages.error(request, "Please select a preferred lab.", extra_tags='app5')
        return redirect('joinus:apply')

    Application.objects.create(
        user=request.user,
        labpreference=labpreference,
        motivation=motivation
    )

    messages.success(request, "Application submitted. Thank you!", extra_tags='app5')
    return redirect('joinus:apply') 
