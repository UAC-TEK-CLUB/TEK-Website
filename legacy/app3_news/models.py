from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.conf import settings
# Create your models here.

class Post(models.Model):
    CATEGORY_CHOICES = [
        ('announcement', 'Announcement'),
    ]

    postname = models.CharField(max_length=500)  
    contents = models.CharField(max_length=1000)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='event_posts')
    date = models.DateTimeField(default=timezone.now, max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='announcement')

    def __str__(self):
        return self.postname

class PostFile(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='uploads/', blank=True, null=True)
    
    def is_image(self):
        return self.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))


    def __str__(self):
        return self.file.name



class Event(models.Model):
    title = models.CharField(max_length=200) 
    date = models.DateField() 
    description = models.TextField(max_length=1000) 

    def __str__(self):
        return self.title