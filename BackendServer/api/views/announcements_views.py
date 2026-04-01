from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models.announcement import Announcement
from api.models.courses import Course
from api.serializer import AnnouncementSerializer
from api.permissions import IsAdmin, IsTeacher, IsStudent
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getAnnouncements(request):
    announcements = Announcement.objects.all()

    course_id = request.query_params.get('course_id')
    author_id = request.query_params.get('author_id')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if course_id:
        announcements = announcements.filter(course__id=course_id)
    if author_id:
        announcements = announcements.filter(author__id=author_id)
    if date_from:
        announcements = announcements.filter(created_at__gte=date_from)
    if date_to:
        announcements = announcements.filter(created_at__lte=date_to)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(announcements, request)
    serializer = AnnouncementSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def getMyAnnouncements(request):
    announcements = Announcement.objects.filter(Q(course__enrollment__student=request.user) | Q(course=None))

    course_id = request.query_params.get('course_id')
    author_id = request.query_params.get('author_id')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if course_id:
        announcements = announcements.filter(course__id=course_id)
    if author_id:
        announcements = announcements.filter(author__id=author_id)
    if date_from:
        announcements = announcements.filter(created_at__gte=date_from)
    if date_to:
        announcements = announcements.filter(created_at__lte=date_to)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(announcements, request)
    serializer = AnnouncementSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def addAnnouncement(request):
    serializer = AnnouncementSerializer(data=request.data)

    if request.user.role == 'teacher':
        course_id = request.data.get('course')
        if not course_id:
            return Response({'error': 'COURSE_ID_REQUIRED'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'COURSE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
        if course.teacher != request.user:
            return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)

        if serializer.is_valid():
            serializer.save(author=request.user)
            logger.info(f"User {request.user} added a {serializer.data} to {course.course_name}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif serializer.is_valid():
        serializer.save(author=request.user)
        logger.info(f"User {request.user} added an {serializer.data}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin | IsTeacher])
def editAnnouncement(request, pk):
    try:
        announcement = Announcement.objects.get(pk=pk)
    except Announcement.DoesNotExist:
        return Response({'error': 'ANNOUNCEMENT_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role == 'teacher':
        if not announcement.course or announcement.course.teacher != request.user:
            return Response({'error': 'PERMISSION_DENIED'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = AnnouncementSerializer(announcement)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = AnnouncementSerializer(announcement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user} edited an {serializer.data}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        announcement.delete()
        logger.warning(f"User {request.user} deleted an announcement with id {pk}")
        return Response(status=status.HTTP_204_NO_CONTENT)

