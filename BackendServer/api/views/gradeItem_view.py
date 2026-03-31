from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models import GradeItem, Course
from api.serializer import GradeItemSerializer
from api.permissions import IsAdmin, IsTeacher
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getGradeItems(request):
    grade_item = GradeItem.objects.all()

    grade_name = request.query_params.get('grade_name')
    course_id = request.query_params.get('course_id')
    if grade_name:
        grade_item = grade_item.filter(grade_name__icontains=grade_name)
    if course_id:
        grade_item = grade_item.filter(course__id=course_id)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(grade_item, request)
    serializer = GradeItemSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacher])
def getMyGradeItems(request):
    grade_item = GradeItem.objects.filter(course__teacher=request.user)

    grade_name = request.query_params.get('grade_name')
    course_id = request.query_params.get('course_id')
    if grade_name:
        grade_item = grade_item.filter(grade_name__icontains=grade_name)
    if course_id:
        grade_item = grade_item.filter(course__id=course_id)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(grade_item, request)
    serializer = GradeItemSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def addGradeItem(request):
    serializer = GradeItemSerializer(data=request.data)

    course_id = request.data.get('course')
    if not course_id:
        return Response({'error': 'COURSE_ID_REQUIRED'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'COURSE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if GradeItem.objects.filter(grade_name=request.data.get('grade_name'), course_id=course_id).exists():
        return Response({'error': 'GRADE_ITEM_ALREADY_EXISTS'}, status=status.HTTP_400_BAD_REQUEST)

    if request.user.role.ADMIN or (request.user.role.TEACHER and course.teacher == request.user):
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Grade item {serializer.data['grade_name']} created by user {request.user} for {course.course_name}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def editGradeItem(request, pk):
    try:
        grade_item = GradeItem.objects.get(pk=pk)
    except GradeItem.DoesNotExist:
        return Response({'error': 'GRADE_ITEM_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = GradeItemSerializer(grade_item)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = GradeItemSerializer(grade_item, data=request.data, partial=True)
        if request.user.role.ADMIN or (request.user.role.TEACHER and grade_item.course.teacher == request.user):
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Grade item {serializer.data['grade_name']} updated by user {request.user} for {grade_item.course.course_name}")
                return Response(serializer.data)
        else:
            return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if request.user.role.ADMIN or (request.user.role.TEACHER and grade_item.course.teacher == request.user):
            grade_item.delete()
            logger.warning(f"Grade item {grade_item.grade_name} deleted by user {request.user} from {grade_item.course.course_name}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)