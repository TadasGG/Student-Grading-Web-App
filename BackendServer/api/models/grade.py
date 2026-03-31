from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Grade(models.Model):
    grade = models.DecimalField(max_digits=4, decimal_places=2, validators=[MinValueValidator(1), MaxValueValidator(10)])
    grade_item = models.ForeignKey('api.GradeItem', on_delete=models.CASCADE)
    graded_by = models.ForeignKey('api.User', on_delete=models.SET_NULL, null=True, related_name='grades_given')
    student = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='grades_received')
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['grade_item', 'student']

    def __str__(self):
        return f'Grade: {self.grade}'
