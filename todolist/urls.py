from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('create', views.create, name='create'),
    path('room', views.room, name='room'),
    path("update-task/", views.update_task, name="update_task"),
    path("remove-task/", views.remove_task, name="remove_task"),
    path("add_task/", views.add_task, name="add_task"),
    path("add_category/", views.add_category, name="add_category"),
    path("remove_category/", views.remove_category, name="remove_category"),
    path('leave_room/', views.leave_room, name='leave_room'),

]