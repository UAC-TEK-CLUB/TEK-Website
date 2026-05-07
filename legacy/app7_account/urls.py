from django.urls import path
from . import views

app_name = 'account'

urlpatterns = [
    path('signin/', views.signin_view, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('mypage/', views.mypage, name='mypage'),
]
