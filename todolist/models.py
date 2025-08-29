from django.db import models
from django.contrib.auth.hashers import make_password

class Room(models.Model):
    name = models.CharField(max_length=50)
    private_key = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # only hashes on create (on the first time the objects is created)
            self.private_key = make_password(self.private_key)
        super().save(*args, **kwargs)


    def __str__(self):
        return (f"---------------------------------------------------------------"
                f"\n{self.pk}"
                f"\n{self.name}"
                f"\nKey: {self.private_key} "
                f"\nCreated: {self.created_at.strftime('%d/%m/%Y - %H:%M')}\n\n")

class Category(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    room = models.ForeignKey(Room, related_name='categories', on_delete=models.CASCADE)

    def __str__(self):
        return (f"\nName: {self.name}"
                f"\nForeign Key: {self.room.pk}")

class ToDoItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items', null=True)
    title = models.CharField(max_length=100)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return (f"---------------------------------------------------------------"
                f"\n{self.id}"
                f"\nTitle: {self.title} "
                f"\nCreated: {self.created_at.strftime('%d%m%Y - %H:%M')}\n\n")