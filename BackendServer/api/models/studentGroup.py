from django.db import models

class StudentGroup(models.Model):
    group_name = models.CharField(max_length=8, unique=True)

    def __str__(self):
        return f'Group: {self.group_name}'