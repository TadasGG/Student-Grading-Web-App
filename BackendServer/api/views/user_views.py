from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models.user import User
from api.serializer import UserSerializer, RegisterSerializer, MyProfileSerializer
from api.permissions import IsAdmin
import logging
from api.utils import generate_temp_password

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getUsers(request):
    users = User.objects.all()

    first_name = request.query_params.get('first_name')
    last_name = request.query_params.get('last_name')
    role = request.query_params.get('role')
    student_group = request.query_params.get('student_group')

    if first_name:
        users = users.filter(first_name__icontains=first_name)
    if last_name:
        users = users.filter(last_name__icontains=last_name)
    if role:
        users = users.filter(role=role)
    if student_group:
        users = users.filter(student_group__id=student_group)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def getMyProfile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        tracked_fields = ['first_name', 'last_name', 'email']
        old_values = {field: getattr(request.user, field) for field in tracked_fields}

        serializer = MyProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            for field in tracked_fields:
                new_value = getattr(request.user, field)
                if old_values[field] != new_value:
                    logger.info(f'{request.user} changed their {field} from {old_values[field]} to {new_value}')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def addUser(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        logger.info(f'{request.user} created a new user: {serializer.data["email"]}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def editUser(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'USER_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)


    elif request.method == 'PATCH':
        tracked_fields = ['role', 'email', 'student_group']
        old_values = {field: getattr(user, field) for field in tracked_fields}

        if user == request.user and 'role' in request.data and request.data['role'] != user.role:
            return Response({'error': 'CANNOT_CHANGE_YOUR_OWN_ROLE'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            for field in tracked_fields:
                new_value = getattr(user, field)
                if old_values[field] != new_value:
                    logger.info(f'{request.user} changed {field} of {user.email} from {old_values[field]} to {new_value}')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if user == request.user:
            return Response({'error': 'CANNOT_DELETE_YOURSELF'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        logger.warning(f'{request.user} deleted the user: {user.email}')
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changeMyPassword(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not request.user.check_password(current_password):
        return Response({'error': 'INCORRECT_PASSWORD'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'error': 'PASSWORDS_DO_NOT_MATCH'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.must_change_password = False
    request.user.save()

    logger.info(f'{request.user} changed their password')
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def resetUserPassword(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'USER_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    temp_password = generate_temp_password()
    user.set_password(temp_password)
    user.must_change_password = True
    user.save()

    logger.warning(f'{request.user} reset password for {user.email}')
    return Response({'temporary_password': temp_password}, status=status.HTTP_200_OK)