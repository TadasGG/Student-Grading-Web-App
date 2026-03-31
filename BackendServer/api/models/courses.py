from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Course(models.Model):
    course_name = models.CharField(max_length=100)
    course_description = models.CharField(max_length=250, null=True, blank=True)
    semester = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    created_at = models.DateTimeField(auto_now_add=True)
    teacher = models.ForeignKey('api.User', on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f'Course: {self.course_name}'
