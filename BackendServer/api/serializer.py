from rest_framework import serializers
from api.models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'student_group']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'role']
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class MyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class StudentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class GradeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeItem
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class GradeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeHistory
        fields = '__all__'

class GradeItemSummarySerializer(serializers.ModelSerializer):
    grade = serializers.SerializerMethodField()
    def get_grade(self, obj):
        request = self.context.get('request')
        try:
            grade = Grade.objects.get(grade_item=obj, student=request.user)
            return grade.grade
        except Grade.DoesNotExist:
            return None
    class Meta:
        model = GradeItem
        fields = ['id', 'grade_name', 'max_grade', 'grade']

class CourseSummarySerializer(serializers.ModelSerializer):
    grade_items = serializers.SerializerMethodField()

    def get_grade_items(self, obj):
        request = self.context.get('request')
        grade_items = GradeItem.objects.filter(course=obj)
        return GradeItemSummarySerializer(grade_items, many=True, context={'request': request}).data

    class Meta:
        model = Course
        fields = ['id', 'course_name', 'course_description', 'semester', 'teacher', 'grade_items']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'