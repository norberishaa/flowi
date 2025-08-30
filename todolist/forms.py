from django import forms
from . import models

class CreateRoom(forms.ModelForm):
    class Meta:
        model = models.Room
        fields = ['name', 'private_key']
        widgets = {
            'name': forms.TextInput(attrs={'autocomplete': 'off', 'spellcheck': 'false', 'placeholder': 'Enter a '
                                                                                                        'unique Room '
                                                                                                        'Name'}),
            'private_key': forms.TextInput(attrs={'readonly': 'readonly', 'class': 'selectable-input'})
        }

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if len(name) > 100:
            raise forms.ValidationError("Name cannot be longer than 100 characters.")
        return name.lower()