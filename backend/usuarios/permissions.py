from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    """
    Permite acceso total (CRUD) solo a usuarios con rol 'admin'.
    Deniega acceso a Coordinadores, Solicitantes, etc.
    """
    def has_permission(self, request, view):
        # Verifica que esté logueado y que su rol sea 'admin'
        return bool(request.user and request.user.is_authenticated and 
                    request.user.rol and request.user.rol.nombre_rol == 'admin')

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite ver (GET) a cualquier usuario autenticado (Coordinadores/Solicitantes),
    pero crear, editar o borrar (POST, PUT, DELETE) solo al 'admin'.
    """
    def has_permission(self, request, view):
        # Métodos seguros (GET, HEAD, OPTIONS) permitidos para todos los logueados
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        
        # Métodos de escritura solo para admin
        return bool(request.user and request.user.is_authenticated and 
                    request.user.rol and request.user.rol.nombre_rol == 'admin')