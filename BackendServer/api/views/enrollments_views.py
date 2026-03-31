from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models import Enrollment, StudentGroup, Course, User
from api.serializer import EnrollmentSerializer
from api.permissions import IsAdmin, IsStudent
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getEnrollments(request):
    enrollment = Enrollment.objects.all()

    student_id = request.query_params.get('student_id')
    course_id = request.query_params.get('course_id')
    enrolled_at = request.query_params.get('enrolled_at')
    if student_id:
        enrollment = enrollment.filter(student__id=student_id)
    if course_id:
        enrollment = enrollment.filter(course__id=course_id)
    if enrolled_at:
        enrollment = enrollment.filter(enrolled_at=enrolled_at)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(enrollment, request)
    serializer = EnrollmentSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def getMyEnrollments(request):
    enrollment = Enrollment.objects.filter(student=request.user)

    course_id = request.query_params.get('course_id')
    if course_id:
        enrollment = enrollment.filter(course__id=course_id)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(enrollment, request)
    serializer = EnrollmentSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def addEnrollment(request):
    serializer = EnrollmentSerializer(data=request.data)

    if Enrollment.objects.filter(student_id=request.data.get('student'), course_id=request.data.get('course')).exists():
        return Response({'error': 'STUDENT_ALREADY_ENROLLED'}, status=status.HTTP_400_BAD_REQUEST)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def bulkEnrollGroup(request):
    group_id = request.data.get('group')
    course_id = request.data.get('course')

    try:
        group = StudentGroup.objects.get(pk=group_id)
    except StudentGroup.DoesNotExist:
        return Response({'error': 'GROUP_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'COURSE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    created_enrollments = []
    already_enrolled = []

    for student in User.objects.filter(student_group=group, role=User.Role.STUDENT):
        if Enrollment.objects.filter(student=student, course=course).exists():
            already_enrolled.append(student.id)
            continue
        enrollment_data = {'student': student.id, 'course': course.id}
        serializer = EnrollmentSerializer(data=enrollment_data)
        if serializer.is_valid():
            serializer.save()
            created_enrollments.append(serializer.data)
        else:
            continue

    logger.info(f'{request.user} enrolled group {group.id} to course {course.id}')

    return Response({
        'created_enrollments': created_enrollments,
        'already_enrolled': already_enrolled
    }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def getOrDeleteEnrollment(request, pk):
    try:
        enrollment = Enrollment.objects.get(pk=pk)
    except Enrollment.DoesNotExist:
        return Response({'error': 'ENROLLMENT_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data)

    if request.method == 'DELETE':
        enrollment.delete()
        logger.warning(f'{request.user} deleted enrollment {enrollment.id}. Student {enrollment.student_id} was removed from course {enrollment.course_id}')
        return Response(status=status.HTTP_204_NO_CONTENT)
