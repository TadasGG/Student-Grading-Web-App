from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class GradeHistory(models.Model):
    grade = models.DecimalField(max_digits=4, decimal_places=2, validators=[MinValueValidator(1), MaxValueValidator(10)])
    grade_item = models.ForeignKey('api.GradeItem', on_delete=models.CASCADE)
    changed_by = models.CharField(max_length=100, null=True)
    student = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='grade_history_received')
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Grade: {self.grade}'
