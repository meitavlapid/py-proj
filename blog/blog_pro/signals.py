from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, User
from rest_framework.authtoken.models import Token
from blog_pro.models import UserProfile


@receiver(post_save, sender=User)
def perform_add_user_to_users_group(sender, instance, created, **kwargs):
    if not created:
        return

    group, _ = Group.objects.get_or_create(name='users')
    instance.groups.add(group)
    instance.save()

    UserProfile.objects.get_or_create(user=instance)
    Token.objects.get_or_create(user=instance)

    print(f' User {instance.username} added to group {group.name}')
