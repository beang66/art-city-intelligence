import os

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
CONTACT_FROM_EMAIL = os.getenv("CONTACT_FROM_EMAIL", "Art City Intelligence <onboarding@resend.dev>")
CONTACT_TO_EMAIL = os.getenv("CONTACT_TO_EMAIL", "beang66@gmail.com")
