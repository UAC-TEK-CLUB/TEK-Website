from django.urls import path
from . import views

app_name = 'news'

urlpatterns = [
    path('announcement/', views.announcement, name='announcement'),
    path('announcement_detail/<int:id>/', views.announcement_detail, name='announcement_detail'),
    path('announcement/create/', views.announcement_create, name='announcement_create'),
    path('announcement/<int:id>/edit/', views.announcement_edit, name='announcement_edit'),
    path('announcement/<int:id>/delete/', views.announcement_delete, name='announcement_delete'),
    path('event/', views.event, name='event'),
]