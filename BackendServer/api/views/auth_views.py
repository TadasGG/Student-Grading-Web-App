from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework import status
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        data['role'] = self.user.role
        data['id'] = self.user.id
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name

        logger.log(logging.INFO, f"User {self.user} logged in.")

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @ratelimit(key='ip', rate='5/m', method='POST', block=True)
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Ratelimited:
            return Response({'error': 'TOO_MANY_REQUESTS'}, status=status.HTTP_429_TOO_MANY_REQUESTS)