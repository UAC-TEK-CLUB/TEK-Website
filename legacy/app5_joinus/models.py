from django.db import models
from django.contrib.auth.models import User

class Application(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='application')
    labpreference = models.CharField(max_length=100)          
    motivation = models.TextField(blank=True)       
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Application by {self.user.username} for {self.labpreference}'

    def fullname(self):
        first = self.user.first_name or ''
        middle = getattr(self.user.profile, 'middle_name', '') if hasattr(self.user, 'profile') else ''
        last = self.user.last_name or ''
        parts = [p for p in [first, middle, last] if p]
        return " ".join(parts) or self.user.username

    def email(self):
        return self.user.email

    def phonenumber(self):
        return getattr(self.user.profile, 'phonenumber', '') if hasattr(self.user, 'profile') else ''

    def kakaotalkID(self):
        return getattr(self.user.profile, 'kakaotalkID', '') if hasattr(self.user, 'profile') else ''

    def gender(self):
        return getattr(self.user.profile, 'gender', '') if hasattr(self.user, 'profile') else ''

    def academicyear(self):
        return getattr(self.user.profile, 'academicyear', '') if hasattr(self.user, 'profile') else ''

    def intendedmajor(self):
        return getattr(self.user.profile, 'intendedmajor', '') if hasattr(self.user, 'profile') else ''

