from django.db import models

class Announcement(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('api.User', on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey('api.Course', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'{self.created_at} {self.title}: {self.description}'