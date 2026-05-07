from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib import auth
from django.db import transaction
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from .models import UserProfile



def signin_view(request):
    if request.method == "POST":
        username = request.POST.get("username")   
        password = request.POST.get("password")   
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('landing:landing')  
        else:
            messages.error(request, 'Invalid username or password', extra_tags='app7')
            return redirect('account:signin')   
    return render(request, 'signin.html')       

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirmpassword = request.POST.get('confirmpassword')
        phonenumber = request.POST.get('phonenumber')
        kakaotalkID = request.POST.get('kakaotalkID')
        first_name = request.POST.get('first_name')
        middle_name = request.POST.get('middle_name')
        last_name = request.POST.get('last_name')
        gender = request.POST.get('gender') 
        academicyear = request.POST.get('academicyear')
        intendedmajor = request.POST.get('intendedmajor')

        errors = {}
        if User.objects.filter(username=username).exists():
            errors['username_error'] = 'This ID already exists.'
        if User.objects.filter(email=email).exists():
            errors['email_error'] = 'This Email already exists.'
        if password != confirmpassword:
            errors['password_error'] = 'Passwords do not match.'
        if errors:
            return render(request, 'signup.html', {'form_data': request.POST, 'error_messages': errors})

        user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)


        UserProfile.objects.create(
            user=user,
            phonenumber=phonenumber,
            kakaotalkID=kakaotalkID,
            middle_name=middle_name,
            gender=gender,
            academicyear=academicyear,
            intendedmajor=intendedmajor,
        )

        return redirect('account:signin')  

    return render(request, 'signup.html')

def logout_view(request):
    auth.logout(request)
    return redirect('landing:landing')

# app7_account/views.py



@login_required
@transaction.atomic
def mypage(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        request.user.first_name = (request.POST.get("first_name") or "").strip()
        request.user.last_name  = (request.POST.get("last_name")  or "").strip()
        request.user.email      = (request.POST.get("email")      or "").strip()

        profile.middle_name     = (request.POST.get("middle_name")   or "").strip()
        profile.phonenumber     = (request.POST.get("phonenumber")   or "").strip()
        profile.kakaotalkID     = (request.POST.get("kakaotalkID")   or "").strip()
        profile.gender          = (request.POST.get("gender")        or "").strip()
        profile.academicyear    = (request.POST.get("academicyear")  or "").strip()
        profile.intendedmajor   = (request.POST.get("intendedmajor") or "").strip()
        profile.status          = (request.POST.get("status") or "").strip()
        profile.lab          = (request.POST.get("lab") or "").strip()


        request.user.save()
        profile.save()

        current_password      = request.POST.get("current_password") or ""
        new_password          = request.POST.get("new_password") or ""
        confirm_new_password  = request.POST.get("confirm_new_password") or ""

        had_pw_error = False
        if current_password or new_password or confirm_new_password:
            if not (current_password and new_password and confirm_new_password):
                messages.error(request, "To change password, fill all password fields.", extra_tags='app7')
                had_pw_error = True
            elif not request.user.check_password(current_password):
                messages.error(request, "Current password is incorrect.", extra_tags='app7')
                had_pw_error = True
            elif new_password != confirm_new_password:
                messages.error(request, "New passwords do not match.", extra_tags='app7')
                had_pw_error = True
            else:
                request.user.set_password(new_password)
                request.user.save()
                update_session_auth_hash(request, request.user)
                messages.success(request, "Password updated.")

        messages.success(request, "Profile saved.", extra_tags='app7')
        return redirect("account:mypage")

    # GET
    initials = (
        (request.user.first_name[:1] + request.user.last_name[:1]).upper()
        if (request.user.first_name or request.user.last_name)
        else request.user.username[:2].upper()
    )
    return render(request, "mypage.html", {
        "profile": profile,
        "user_initials": initials,
    })
