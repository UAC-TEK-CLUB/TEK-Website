from django import forms
from .models import Post
from .widgets import MultipleFileInput


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['postname', 'contents']
        widgets = {
            'postname': forms.TextInput(attrs={
                'placeholder': 'Title',
                'class': 'form-input'
            }),
            'contents': forms.Textarea(attrs={
                'placeholder': 'Contents',
                'class': 'form-textarea'
            }),
        }

class FileForm(forms.Form):
    files = forms.FileField(
        widget=MultipleFileInput(attrs={'multiple': True, 'class': 'file-input'}),
        required=False
    )