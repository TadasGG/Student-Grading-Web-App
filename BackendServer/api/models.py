from django.db import models

class Student(models.Model):
    firstName = models.CharField()
    lastName = models.CharField()
    # email = models.CharField()
    # age = models.DateField()

    def __str__(self):
        return self.firstName + " " + self.lastName
