from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class GradeItem(models.Model):
    grade_name = models.CharField(max_length=50)
    grade_description = models.CharField(max_length=250, null=True, blank=True)
    course = models.ForeignKey('api.Course', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    max_grade = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])

    def __str__(self):
        return f'Course Grade: {self.grade_name}'
