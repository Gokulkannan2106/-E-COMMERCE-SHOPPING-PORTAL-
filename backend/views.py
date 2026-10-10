"""
React SPA catch-all view.

Serves the Vite-built index.html for every URL that isn't
handled by the Django admin or the /api/ REST endpoints.
This makes the whole project accessible on a single port.
"""
from django.http import FileResponse, Http404
from django.conf import settings
import os


def react_app(request, *args, **kwargs):
    """Serve the React SPA index.html for every frontend route."""
    index_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html')
    if not os.path.exists(index_path):
        raise Http404(
            "React build not found. Run: cd frontend && npm run build"
        )
    return FileResponse(open(index_path, 'rb'), content_type='text/html')
