from rest_framework.permissions import BasePermission
from api.models.user import User

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.ADMIN


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.TEACHER


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.Role.STUDENT