from django.db import models

class Enrollment(models.Model):
    student = models.ForeignKey('api.User', on_delete=models.CASCADE)
    course = models.ForeignKey('api.Course', on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f'Student: {self.student.first_name} {self.student.last_name} is in Course: {self.course.course_name}'