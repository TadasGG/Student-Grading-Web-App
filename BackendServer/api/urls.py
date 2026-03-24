from django.urls import path
from .views import getUsers, addUser, editStudent

urlpatterns = [
    path('students', getUsers, name='getUser'),
    path('students/create', addUser, name='addUser'),
    path('students/<int:pk>', editStudent, name='editStudent')
]