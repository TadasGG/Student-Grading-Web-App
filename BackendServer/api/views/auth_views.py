from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
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
        data['must_change_password'] = self.user.must_change_password

        logger.log(logging.INFO, f"User {self.user} logged in.")

        return data

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)

            if response.status_code == 200:
                access = response.data.get("access")
                refresh = response.data.get("refresh")

                response.set_cookie(
                    "access",
                    access,
                    httponly=True,
                    secure=False,
                    samesite="Strict",
                    path="/",
                )
                response.set_cookie(
                    "refresh",
                    refresh,
                    httponly=True,
                    secure=False,
                    samesite="Strict",
                    path="/",
                )

                del response.data["access"]
                del response.data["refresh"]

                return response

        except Ratelimited:
            return Response({'error': 'TOO_MANY_REQUESTS'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({'message': 'Logged out'}, status=status.HTTP_200_OK)
        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")
        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'role': request.user.role,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'must_change_password': request.user.must_change_password
        })