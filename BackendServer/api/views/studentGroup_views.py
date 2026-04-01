from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from api.models.studentGroup import StudentGroup
from api.serializer import StudentGroupSerializer
from api.permissions import IsAdmin
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def getGroups(request):
    groups = StudentGroup.objects.all()

    group_name = request.query_params.get('group_name')
    if group_name:
        groups = groups.filter(group_name=group_name)

    paginator = PageNumberPagination()
    result = paginator.paginate_queryset(groups, request)
    serializer = StudentGroupSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def addGroup(request):
    serializer = StudentGroupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        logger.info(f'{request.user} created a new group: {serializer.data["group_name"]}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def editGroup(request, pk):
    try:
        group = StudentGroup.objects.get(pk=pk)
    except StudentGroup.DoesNotExist:
        return Response({'error': 'GROUP_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentGroupSerializer(group)
        return Response(serializer.data)


    elif request.method == 'PATCH':
        tracked_fields = ['group_name']
        old_values = {field: getattr(group, field) for field in tracked_fields}

        serializer = StudentGroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            for field in tracked_fields:
                new_value = getattr(group, field)
                if old_values[field] != new_value:
                    logger.info(f'{request.user} changed {field} of {group.group_name} from {old_values[field]} to {new_value}')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        group.delete()
        logger.warning(f'{request.user} deleted the group: {group.group_name}')
        return Response(status=status.HTTP_204_NO_CONTENT)