from fastapi import HTTPException, status


class ProoflyException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(ProoflyException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class TenantMismatchException(ProoflyException):
    def __init__(self, detail: str = "Access to requested tenant resource denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthorizedException(ProoflyException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class RateLimitExceededException(ProoflyException):
    def __init__(self, detail: str = "Too many requests. Please try again later."):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)


class InactiveResourceException(ProoflyException):
    def __init__(self, detail: str = "This page or widget is currently inactive."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
