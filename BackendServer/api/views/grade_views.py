from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models import Grade, GradeItem
from api.serializer import GradeSerializer, GradeHistorySerializer
from api.permissions import IsAdmin, IsTeacher
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getGrades(request):
    grade = Grade.objects.all()

    grade_item_id = request.query_params.get('grade_item_id')
    graded_by = request.query_params.get('graded_by_id')
    student = request.query_params.get('student_id')

    if grade_item_id:
        grade = grade.filter(grade_item__id=grade_item_id)
    if graded_by:
        grade = grade.filter(graded_by__id=graded_by)
    if student:
        grade = grade.filter(student__id=student)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(grade, request)
    serializer = GradeSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def addGrade(request):
    serializer = GradeSerializer(data=request.data)

    grade_item_id = request.data.get('grade_item_id')
    if not grade_item_id:
        return Response({'error': 'GRADE_ITEM_ID_REQUIRED'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        grade_item = GradeItem.objects.get(pk=grade_item_id)
    except GradeItem.DoesNotExist:
        return Response({'error': 'GRADE_ITEM_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)


    if not (request.user.role == 'admin' or (request.user.role == 'teacher' and grade_item.course.teacher == request.user)):
        return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)

    if Grade.objects.filter(grade_item=grade_item, student=request.data.get('student')).exists():
        return Response({'error': 'GRADE_ALREADY_EXISTS'}, status=status.HTTP_400_BAD_REQUEST)

    if serializer.is_valid():
        serializer.save(graded_by=request.user)
        logger.info(f"User {request.user} added a {serializer.data} to {grade_item.grade_name} in {grade_item.course.course_name}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def editGrade(request, pk):
    try:
        grade = Grade.objects.get(pk=pk)
    except Grade.DoesNotExist:
        return Response({'error': 'GRADE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if not (request.user.role == 'admin' or (request.user.role == 'teacher' and grade.grade_item.course.teacher == request.user)):
        return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = GradeSerializer(grade)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        old_grade = grade.grade

        serializer = GradeSerializer(grade, data=request.data, partial=True)
        history_serializer = GradeHistorySerializer(data={'grade': grade.grade,
                                                          'grade_item': grade.grade_item.id,
                                                          'student': grade.student.id})

        if serializer.is_valid() and history_serializer.is_valid():
            history_serializer.save(changed_by=f"{request.user.first_name} {request.user.last_name}")
            serializer.save(graded_by=request.user)
            logger.info(f"User {request.user} updated a grade from {old_grade} to {serializer.data} for {grade.grade_item} in {grade.grade_item.course}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
