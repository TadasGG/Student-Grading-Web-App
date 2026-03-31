from django.urls import path
from .views import *

urlpatterns = [
    ### User viewer URLs ###
    path('user', getUsers, name='getUser'),
    path('user/create', addUser, name='addUser'),
    path('user/<int:pk>', editUser, name='editUser'),
    path('user/<int:pk>/changepass', resetUserPassword, name='resetUserPassword'),
    path('myprofile', getMyProfile, name='getMyProfile'),
    path('myprofile/changepassword', changeMyPassword, name='changeMyPassword'),
    ###
    ### StudentGroup viewer URLs ###
    path('studentGroups', getGroups, name='getGroups'),
    path('studentGroups/create', addGroup, name='addGroups'),
    path('studentGroups/<int:pk>', editGroup, name='editGroups'),
    ###
    ### Course viewer URLs ###
    path('courses', getCourses, name='getCourses'),
    path('courses/create', addCourse, name='addCourse'),
    path('courses/my', getMyCourses, name='getMyCourses'),
    path('courses/<int:pk>', editCourse, name='editCourse'),
    path('courses/<int:pk>/enrollments', getEnrolledStudents, name='getEnrolledStudents'),
    ###
    ### Enrollment viewer URLs ###
    path('enrollments', getEnrollments, name='getEnrollments'),
    path('enrollments/create', addEnrollment, name='addEnrollment'),
    path('enrollments/bulk', bulkEnrollGroup, name='bulkEnrollGroup'),
    path('enrollments/myenrollments', getMyEnrollments, name='getMyEnrollments'),
    path('enrollments/<int:pk>', getOrDeleteEnrollment, name='editEnrollment'),
]