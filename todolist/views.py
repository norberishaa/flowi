from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from . import forms
from django.conf import settings
import secrets
import requests
from todolist.models import Room, Category, ToDoItem
from django.contrib.auth.hashers import check_password
from django.db.models import Max
import json

# -------------------------------------------EXTRA SAUCE-------------------------------------------

# turnstile verification
def verify_turnstile_token(token, remote_ip=None):
    data = {
        'secret': settings.CLOUDFLARE_SECRET_KEY,
        'response': token,
    }
    if remote_ip:
        data['remoteip'] = remote_ip

    try:
        resp = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data=data,
            timeout=5
        )
        return resp.json()
    except Exception:
        return {"success": False}

# generates secret ROOM key
def key_generator():
    return secrets.token_hex(16)

def update_task(request):
    if request.method == "POST":
        data = json.loads(request.body)
        new_title = data.get("title")
        task_id = data.get("taskId")

        task = get_object_or_404(ToDoItem, id=task_id)
        task.title = new_title
        task.save()

        return JsonResponse({"status": "ok"})
    return JsonResponse({"error": "Invalid request"}, status=400)


def remove_task(request):
    data=json.loads(request.body)
    task_id = data.get("taskId")
    if request.method == "POST":
            task = ToDoItem.objects.get(id=task_id)
            task.delete()
            return JsonResponse({"status": "ok"})

    return JsonResponse({"error": "Invalid request"}, status=400)


def add_task(request):
    if request.method == "POST":
        data = json.loads(request.body)
        category_id = data.get("category_id")
        category = Category.objects.get(id=category_id)
        max_position = category.items.aggregate(max_pos=Max('position'))['max_pos'] or 0
        position = max_position + 1
        task = ToDoItem.objects.create(category=category, title="New Task", position=position)

        return JsonResponse({
            "id": task.id,
            "title": task.title,
            "position": task.position
        })
    return JsonResponse({"error": "Invalid request"}, status=400)

def add_category(request):
    if request.method == "POST":
        data = json.loads(request.body)
        new_category_name = data.get("user_input")

        current_room_id = data.get("roomId")
        current_room = Room.objects.get(id=current_room_id)

        category = Category.objects.create(room=current_room, name=new_category_name)

        return JsonResponse({
            "id": category.id,
            "name": category.name,
        })
    return JsonResponse({"error": "Invalid request"}, status=400)

def remove_category(request):

    data= json.loads(request.body)
    category_id = data.get("categoryId")

    if request.method == "POST":
        category = Category.objects.get(id=category_id)
        category.delete()
        return JsonResponse({ "success": True })

    return JsonResponse({"error": "Invalid request"}, status=400)

def leave_room(request):
    if request.method == "GET":
        return redirect(home)

    return HttpResponse("There was an error,")

# -------------------------------------------MAIN DISH-------------------------------------------
def home(request):
    request.session.pop('verified_room', None)
    return render(request, 'todolist/home.html', {'title': 'flowi.'})


def create(request):
    token = request.POST.get('cf-turnstile-response')
    remote_ip = request.META.get('REMOTE_ADDR')

    if request.method == 'POST':
        if verify_turnstile_token(token, remote_ip).get('success'):
            form = forms.CreateRoom(request.POST)
            if form.is_valid():
                form.save()
                return redirect('home')
        else:
            return HttpResponse("You need to verify the form before creating a new room.")
    else:
        initial_key = key_generator()
        form = forms.CreateRoom(initial={'private_key': initial_key})

    return render(request, 'todolist/create_room.html', {'title': 'Create', 'form': form})

# will call a list of rooms with the name entered by the user during search, will compare each of the rooms found for the private key
def goto_room(room_name, private_key):
    filtered_rooms = Room.objects.filter(name=room_name)
    for r in filtered_rooms:
        if check_password(private_key, r.private_key):
            return r
    return None

def room(request):
    room_id = request.session.get('verified_room')
    if room_id:
        try:
            found_room = Room.objects.get(pk=room_id)
            categories = found_room.categories.all()
            return render(request, 'todolist/room.html', {'room': found_room, 'categories':categories})
        except Room.DoesNotExist:
            request.session.pop('verified_room', None)  # clean session if invalid

    if request.method == 'POST':
        token = request.POST.get('cf-turnstile-response', '').strip()
        room_name = request.POST.get('room', '').strip()
        private_key = request.POST.get('key', '').strip()
        remote_ip = request.META.get('REMOTE_ADDR')

        if not token or not verify_turnstile_token(token, remote_ip).get('success'):
            return HttpResponse(
                "<script>alert('You need to verify the turnstile first! Refresh page and try again.'); window.history.back();</script>"
            )

        found_room = goto_room(room_name, private_key)

        if found_room:
            request.session['verified_room'] = found_room.id
            categories = found_room.categories.all()

            return render(request, 'todolist/room.html',
                          {'room': found_room,
                           'categories':categories})
        else:
            return HttpResponse("<script>alert('No room found!'); window.history.back();</script>")

    return HttpResponse("<script>alert('Wrong request!!!'); window.history.back();</script>")