from django.apps import AppConfig


class BlogProConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog_pro'

    def ready(self):
        import blog_pro.signals
