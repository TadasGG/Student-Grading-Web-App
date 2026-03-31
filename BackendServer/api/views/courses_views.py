from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models.courses import Course
from api.serializer import CourseSerializer, EnrollmentSerializer
from api.permissions import IsAdmin, IsTeacher
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getCourses(request):
    courses = Course.objects.all()

    semester = request.query_params.get('semester')
    teacher_id = request.query_params.get('teacher')
    created_at = request.query_params.get('created_at')
    if semester:
        courses = courses.filter(semester=semester)
    if teacher_id:
        courses = courses.filter(teacher__id=teacher_id)
    if created_at:
        courses = courses.filter(created_at=created_at)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(courses, request)
    serializer = CourseSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def getEnrolledStudents(request, pk):
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'COURSE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    enrollments = course.enrollment_set.all()
    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(enrollments, request)
    serializer = EnrollmentSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTeacher])
def getMyCourses(request):
    courses = Course.objects.filter(teacher=request.user)
    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(courses, request)
    serializer = CourseSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def addCourse(request):
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        logger.info(f'{request.user} created a new course: {serializer.data["course_name"]}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def editCourse(request, pk):
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'COURSE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)


    elif request.method == 'PATCH':
        tracked_fields = ['course_name', 'course_description', 'semester', 'teacher']
        old_values = {field: getattr(course, field) for field in tracked_fields}

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            for field in tracked_fields:
                new_value = getattr(course, field)
                if old_values[field] != new_value:
                    logger.info(f'{request.user} changed {field} of {course.course_name} from {old_values[field]} to {new_value}')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        course.delete()
        logger.warning(f'{request.user} deleted the group: {course.course_name}')
        return Response(status=status.HTTP_204_NO_CONTENT)